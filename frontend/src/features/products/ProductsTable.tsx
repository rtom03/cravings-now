import { DataTable, DataTableColumn } from "../../components/shared/DataTable";

type ProductProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  minWidth?: string;
  selectable: boolean;
  isLoading: boolean;
};

function ProductsTable<T>({
  columns,
  data,
  rowKey,
  emptyMessage,
  minWidth,
  isLoading,
}: ProductProps<T>) {
  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        rowKey={rowKey}
        selectable
        minWidth={minWidth}
        loading={isLoading}
        emptyMessage={
          emptyMessage
            ? `No products match "${emptyMessage}".`
            : "No products found."
        }
      />
    </div>
  );
}

export default ProductsTable;
