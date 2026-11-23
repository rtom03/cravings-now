import { DataTable, DataTableColumn } from "../../components/shared/DataTable";

type OrderProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  minWidth?: string;
  selectable: boolean;
  isLoading: boolean;
};

function OrdersTable<T>({
  columns,
  data,
  rowKey,
  emptyMessage,
  minWidth,
  isLoading,
}: OrderProps<T>) {
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
            ? `No Orders match "${emptyMessage}".`
            : "No Orders found."
        }
      />
    </div>
  );
}

export default OrdersTable;
