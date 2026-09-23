import { useEffect, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import api from '../api/axios';

export default function Inventory() {
    const [data, setData] = useState([]);

    // Petición
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

    // Entradas y Salidas
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
            // Recargamos la tabla para ver el nuevo stock
            fetchProducts();
        } catch (error) {
            console.error("Error al registrar el movimiento:", error);
            alert("Ocurrió un error al registrar el movimiento.");
        }
    };

    // Columna de acciones
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
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2>Kardex - Listado de Productos</h2>
                <button style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>
                    Nuevo Producto
                </button>
            </div>

            <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f3f4f6' }}>
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
                            <td colSpan={columns.length} style={{ textAlign: 'center' }}>No hay productos registrados.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}