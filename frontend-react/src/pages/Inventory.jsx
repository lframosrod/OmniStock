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
        if (movements.length === 0) return alert("No hay movimientos para exportar.");
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
        { header: 'ID', accessorKey: 'id', cell: ({ row }) => <span style={{ color: '#94a3b8' }}>#{row.original.id}</span> },
        { header: 'Nombre del Producto', accessorKey: 'name', cell: ({ row }) => <strong style={{ color: '#f8fafc' }}>{row.original.name}</strong> },
        { header: 'SKU', accessorKey: 'sku' },
        {
            header: 'Stock Actual',
            accessorKey: 'current_stock',
            cell: ({ row }) => {
                const stock = row.original.current_stock;
                let badgeClass = 'badge-success';
                if (stock === 0) badgeClass = 'badge-danger';
                else if (stock < 10) badgeClass = 'badge-warning';

                return (
                    <span className={`badge ${badgeClass}`}>
                        {stock} u.
                    </span>
                );
            }
        },
        {
            header: 'Acciones',
            id: 'acciones',
            cell: ({ row }) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-success" onClick={() => handleMovement(row.original.id, 'ENTRADA')}>
                        + Entrada
                    </button>
                    <button className="btn btn-danger" onClick={() => handleMovement(row.original.id, 'SALIDA')}>
                        - Salida
                    </button>
                    <button className="btn btn-outline" onClick={() => handleViewHistory(row.original.id, row.original.name)}>
                        📋 Historial
                    </button>
                </div>
            )
        }
    ];

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <>
            {/* 1. Inyección de CSS Profesional */}
            <style>{`
        .card { background-color: #1e293b; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #334155; padding: 24px; }
        .table-container { overflow-x: auto; margin-top: 20px; border-radius: 8px; border: 1px solid #334155; }
        .os-table { width: 100%; border-collapse: collapse; }
        .os-table th { background-color: #0f172a; color: #94a3b8; text-transform: uppercase; font-size: 12px; font-weight: 600; padding: 16px; text-align: left; border-bottom: 1px solid #334155; }
        .os-table td { padding: 16px; border-bottom: 1px solid #334155; color: #cbd5e1; font-size: 14px; }
        .os-table tr:last-child td { border-bottom: none; }
        .os-table tbody tr:hover { background-color: #0f172a; transition: background-color 0.2s ease; }
        
        .badge { padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; display: inline-block; }
        .badge-success { background-color: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
        .badge-danger { background-color: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
        .badge-warning { background-color: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }

        .btn { border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
        .btn-primary { background-color: #3b82f6; color: white; }
        .btn-primary:hover { background-color: #2563eb; }
        .btn-success { background-color: #10b981; color: white; }
        .btn-success:hover { background-color: #059669; }
        .btn-danger { background-color: #ef4444; color: white; }
        .btn-danger:hover { background-color: #dc2626; }
        .btn-secondary { background-color: #475569; color: white; }
        .btn-secondary:hover { background-color: #334155; }
        .btn-outline { background-color: transparent; border: 1px solid #475569; color: #cbd5e1; }
        .btn-outline:hover { background-color: #334155; color: white; }
        
        .input-field { width: 100%; padding: 10px 14px; border-radius: 6px; border: 1px solid #475569; background-color: #0f172a; color: white; font-size: 14px; transition: all 0.2s; }
        .input-field:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
        
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; width: 90%; max-width: 850px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .modal-header { padding: 20px 24px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
        .modal-body { padding: 0; overflow-y: auto; }
      `}</style>

            <div className="card">
                {/* Cabecera de la tarjeta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Gestión de Inventario</h2>
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#94a3b8' }}>Administra los productos y registra movimientos en el Kardex.</p>
                    </div>

                    <div style={{ flexGrow: 1, maxWidth: '350px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '14px' }}>🔍</span>
                        <input
                            type="text"
                            className="input-field"
                            style={{ paddingLeft: '38px' }}
                            placeholder="Buscar por nombre o SKU..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    <button
                        className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? '✕ Cancelar' : '+ Nuevo Producto'}
                    </button>
                </div>

                {/* Formulario de Nuevo Producto */}
                {showForm && (
                    <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #334155' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '15px', color: '#f8fafc' }}>Registrar Nuevo Producto</h3>
                        <form onSubmit={handleCreateProduct} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ flexGrow: 1 }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Nombre del Producto</label>
                                <input type="text" required className="input-field" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Código SKU</label>
                                <input type="text" required className="input-field" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} />
                            </div>
                            <button type="submit" className="btn btn-success" style={{ padding: '10px 20px' }}>Guardar</button>
                        </form>
                    </div>
                )}

                {/* Tabla Principal */}
                <div className="table-container">
                    <table className="os-table">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                    ))}
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        No se encontraron productos coincidentes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {totalPages > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                        <button
                            className="btn btn-outline"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            ← Anterior
                        </button>
                        <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                            Página <strong style={{ color: '#f8fafc' }}>{currentPage}</strong> de <strong style={{ color: '#f8fafc' }}>{totalPages}</strong>
                        </span>
                        <button
                            className="btn btn-outline"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                        >
                            Siguiente →
                        </button>
                    </div>
                )}
            </div>

            {/* Modal del Historial (Kardex) */}
            {historyModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 style={{ margin: 0, fontSize: '18px' }}>Libro Mayor: <span style={{ color: '#3b82f6' }}>{historyModal.productName}</span></h3>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button className="btn btn-primary" onClick={exportToCSV}>
                                    📥 CSV
                                </button>
                                <button
                                    onClick={() => setHistoryModal({ isOpen: false, productName: '' })}
                                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer', padding: '0 5px' }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="modal-body">
                            <table className="os-table" style={{ border: 'none' }}>
                                <thead>
                                    <tr>
                                        <th>Fecha y Hora</th>
                                        <th>Tipo de Movimiento</th>
                                        <th>Cantidad</th>
                                        <th>Justificación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.length > 0 ? (
                                        movements.map((mov) => (
                                            <tr key={mov.id}>
                                                <td>{new Date(mov.created_at).toLocaleString()}</td>
                                                <td>
                                                    <span className={`badge ${mov.movement_type === 'ENTRADA' ? 'badge-success' : 'badge-danger'}`}>
                                                        {mov.movement_type}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: '600', color: '#f8fafc' }}>{mov.quantity}</td>
                                                <td style={{ color: '#94a3b8' }}>{mov.notes}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '30px' }}>No hay movimientos registrados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}