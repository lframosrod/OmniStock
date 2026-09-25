import { useEffect, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import api from '../api/axios';

export default function Inventory() {
    const [data, setData] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', sku: '' });

    // Estados para el modal del Kardex
    const [historyModal, setHistoryModal] = useState({ isOpen: false, productName: '' });
    const [movements, setMovements] = useState([]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setData(response.data.data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

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
            fetchProducts();
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
            fetchProducts();
        } catch (error) {
            console.error("Error al crear producto:", error);
            alert("Error al crear el producto. Revisa que el SKU no esté duplicado.");
        }
    };

    // Función para consultar los movimientos y abrir el modal
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2>Listado de Productos</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ backgroundColor: showForm ? '#6b7280' : '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}
                >
                    {showForm ? 'Cancelar' : 'Nuevo Producto'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreateProduct} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1f2937', borderRadius: '8px', display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '14px', color: '#d1d5db' }}>Nombre del Producto</label>
                        <input
                            type="text"
                            required
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #4b5563', backgroundColor: '#374151', color: 'white' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
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
                </tbody>
            </table>

            {/* Modal del Historial (Kardex) */}
            {historyModal.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#1f2937', padding: '20px', borderRadius: '8px', width: '80%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0 }}>Kardex: {historyModal.productName}</h3>
                            <button
                                onClick={() => setHistoryModal({ isOpen: false, productName: '' })}
                                style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                ✕
                            </button>
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