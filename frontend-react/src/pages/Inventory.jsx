import { useEffect, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import api from '../api/axios';

export default function Inventory() {
    const [data, setData] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', sku: '' });

    const [historyModal, setHistoryModal] = useState({ isOpen: false, productName: '' });
    const [movements, setMovements] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Agregamos &sort=id&order=asc para forzar el orden ascendente
    const fetchProducts = async (search = '', page = 1) => {
        try {
            const response = await api.get(`/products?search=${search}&page=${page}&limit=10&sort=id&order=asc`);
            setData(response.data.data);
            setTotalPages(response.data.meta.totalPages);
            setCurrentPage(response.data.meta.currentPage);
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts(searchTerm, currentPage);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, currentPage]);

    const handleMovement = async (productId, type) => {
        const qtyInput = window.prompt(`¿Cuántas unidades de ${type} deseas registrar?`);
        if (!qtyInput) return;

        const quantity = parseInt(qtyInput, 10);
        if (isNaN(quantity) || quantity <= 0) {
            alert("Por favor, ingresa una cantidad válida mayor a 0.");
            return;
        }

        const notes = window.prompt("Agrega una nota para este movimiento (opcional):") || `Movimiento manual desde interfaz`;

        try {
            await api.post('/movements', {
                product_id: productId,
                movement_type: type,
                quantity: quantity,
                notes: notes
            });
            fetchProducts(searchTerm, currentPage);
        } catch (error) {
            console.error("Error al registrar el movimiento:", error);
            alert("Ocurrió un error al registrar el movimiento.");
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products', newProduct);
            setNewProduct({ name: '', sku: '' });
            setShowForm(false);
            setSearchTerm('');
            setCurrentPage(1);
            fetchProducts('', 1);
        } catch (error) {
            console.error("Error al crear producto:", error);
            alert("Error al crear el producto. Revisa que el SKU no esté duplicado.");
        }
    };

    const handleViewHistory = async (productId, productName) => {
        try {
            const response = await api.get(`/products/${productId}/movements`);
            setMovements(response.data.data);
            setHistoryModal({ isOpen: true, productName });
        } catch (error) {
            console.error("Error al cargar el historial:", error);
            alert("No se pudo cargar el historial del producto.");
        }
    };

    const exportToCSV = () => {
        if (movements.length === 0) {
            alert("No hay movimientos para exportar.");
            return;
        }
        const headers = ["Fecha y Hora", "Tipo", "Cantidad", "Notas / Justificación"];
        const rows = movements.map(mov => {
            const date = new Date(mov.created_at).toLocaleString().replace(/,/g, '');
            const type = mov.movement_type;
            const qty = mov.quantity;
            const notes = mov.notes ? `"${mov.notes.replace(/"/g, '""')}"` : "";
            return [date, type, qty, notes].join(",");
        });
        const csvContent = ["\uFEFF" + headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `kardex_${historyModal.productName.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { header: 'ID', accessorKey: 'id' },
        { header: 'Nombre del Producto', accessorKey: 'name' },
        { header: 'SKU', accessorKey: 'sku' },
        { header: 'Stock Actual', accessorKey: 'current_stock' },
        {
            header: 'Acciones',
            id: 'acciones',
            cell: ({ row }) => (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => handleMovement(row.original.id, 'ENTRADA')}
                        style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                    >
                        + Entrada
                    </button>
                    <button
                        onClick={() => handleMovement(row.original.id, 'SALIDA')}
                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                    >
                        - Salida
                    </button>
                    <button
                        onClick={() => handleViewHistory(row.original.id, row.original.name)}
                        style={{ backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                    >
                        📋 Historial
                    </button>
                </div>
            )
        }
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <h2>Listado de Productos</h2>
                <div style={{ flexGrow: 1, maxWidth: '400px', marginLeft: '20px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar por nombre o SKU..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #4b5563', backgroundColor: '#374151', color: 'white' }}
                    />
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ backgroundColor: showForm ? '#6b7280' : '#3b82f6', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px' }}
                >
                    {showForm ? 'Cancelar' : 'Nuevo Producto'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreateProduct} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1f2937', borderRadius: '8px', display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexGrow: 1 }}>
                        <label style={{ fontSize: '14px', color: '#d1d5db' }}>Nombre del Producto</label>
                        <input
                            type="text"
                            required
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #4b5563', backgroundColor: '#374151', color: 'white' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexGrow: 1 }}>
                        <label style={{ fontSize: '14px', color: '#d1d5db' }}>SKU</label>
                        <input
                            type="text"
                            required
                            value={newProduct.sku}
                            onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #4b5563', backgroundColor: '#374151', color: 'white' }}
                        />
                    </div>
                    <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '9px 15px', cursor: 'pointer', borderRadius: '4px' }}>
                        Guardar Producto
                    </button>
                </form>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f3f4f6', color: '#111827' }}>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>
                                    No se encontraron productos coincidentes.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ padding: '8px 16px', backgroundColor: currentPage === 1 ? '#4b5563' : '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Anterior
                    </button>

                    <span style={{ color: '#d1d5db', fontSize: '14px' }}>
                        Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                    </span>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{ padding: '8px 16px', backgroundColor: currentPage === totalPages ? '#4b5563' : '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {historyModal.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#1f2937', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0 }}>Kardex: {historyModal.productName}</h3>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <button
                                    onClick={exportToCSV}
                                    style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}
                                >
                                    📥 Descargar CSV
                                </button>
                                <button
                                    onClick={() => setHistoryModal({ isOpen: false, productName: '' })}
                                    style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left', fontSize: '14px' }}>
                            <thead style={{ backgroundColor: '#374151' }}>
                                <tr>
                                    <th>Fecha y Hora</th>
                                    <th>Tipo</th>
                                    <th>Cantidad</th>
                                    <th>Notas / Justificación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements.length > 0 ? (
                                    movements.map((mov) => (
                                        <tr key={mov.id}>
                                            <td>{new Date(mov.created_at).toLocaleString()}</td>
                                            <td style={{ color: mov.movement_type === 'ENTRADA' ? '#34d399' : '#f87171', fontWeight: 'bold' }}>
                                                {mov.movement_type}
                                            </td>
                                            <td>{mov.quantity}</td>
                                            <td>{mov.notes}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center' }}>No hay movimientos registrados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}