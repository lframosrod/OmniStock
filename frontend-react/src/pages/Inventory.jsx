import { useEffect, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import api from '../api/axios';

export default function Inventory() {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Consumir el endpoint
        api.get('/products')
            .then(response => {
                // Acceder a response.data.data
                setData(response.data.data);
            })
            .catch(error => console.error("Error al cargar productos:", error));
    }, []);

    // Columnas mapeadas
    const columns = [
        { header: 'ID', accessorKey: 'id' },
        { header: 'Nombre del Producto', accessorKey: 'name' },
        { header: 'SKU', accessorKey: 'sku' },
        { header: 'Stock Actual', accessorKey: 'current_stock' },
    ];

    // Inicializar TanStack Table
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div>
            <h2>Kardex - Listado de Productos</h2>
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
                </tbody>
            </table>
        </div>
    );
}