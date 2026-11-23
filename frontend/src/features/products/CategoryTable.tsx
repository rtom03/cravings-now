import { DataTable, DataTableColumn } from "../../components/shared/DataTable";

type CategoryProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  minWidth?: string;
  selectable: boolean;
  isLoading: boolean;
};

function CategoryTable<T>({
  columns,
  data,
  rowKey,
  emptyMessage,
  minWidth,
  isLoading,
}: CategoryProps<T>) {
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

export default CategoryTable;
