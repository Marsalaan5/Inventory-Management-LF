



/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Table } from "antd";
import { itemRender, onShowSizeChange } from "./pagination";

const Datatable = ({ 
  columns, 
  dataSource, 
  pagination, 
  onPaginationChange 
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleTableChange = (paginationConfig) => {
    if (onPaginationChange) {
      onPaginationChange({
        page: paginationConfig.current,
        limit: paginationConfig.pageSize,
      });
    }
  };

  return (
    <Table
      className="table datanew dataTable no-footer"
      rowSelection={rowSelection}
      columns={columns}
      dataSource={dataSource}
      rowKey={(record) => record.id}
      onChange={handleTableChange}
      pagination={{
        showSizeChanger: true,
        pageSizeOptions: ["10", "25", "50", "100"],
        current: pagination?.page || 1,
        pageSize: pagination?.limit || 10,
        total: pagination?.total || 0,
        showTotal: (total, range) =>
          `Showing ${range[0]}-${range[1]} of ${total} items`,
        itemRender: itemRender,
        // onShowSizeChange: onShowSizeChange,
      }}
    />
  );
};

export default Datatable;



// /* eslint-disable react/prop-types */
// /* eslint-disable no-unused-vars */
// import React, { useState, useEffect } from "react";
// import { Table } from "antd";
// import { itemRender, onShowSizeChange } from "./pagination";

// const Datatable = ({ 
//   columns, 
//   dataSource, 
//   pagination, 
//   onPaginationChange 
// }) => {
//   const [selectedRowKeys, setSelectedRowKeys] = useState([]);

//   const onSelectChange = (newSelectedRowKeys) => {
//     console.log("selectedRowKeys changed: ", newSelectedRowKeys);
//     setSelectedRowKeys(newSelectedRowKeys);
//   };

//   const rowSelection = {
//     selectedRowKeys,
//     onChange: onSelectChange,
//   };

//   const handleTableChange = (paginationConfig, filters, sorter) => {
//     console.log('Table change triggered:', {
//       current: paginationConfig.current,
//       pageSize: paginationConfig.pageSize,
//       total: paginationConfig.total
//     });
    
//     if (onPaginationChange) {
//       onPaginationChange({
//         page: paginationConfig.current,
//         limit: paginationConfig.pageSize,
//       });
//     }
//   };


//   useEffect(() => {
//     console.log(' Pagination prop updated:', pagination);
//   }, [pagination]);

//   return (
//     <Table
//       className="table datanew dataTable no-footer"
//       rowSelection={rowSelection}
//       columns={columns}
//       dataSource={dataSource}
//       rowKey={(record) => record.id || record.prod_uuid}
//       onChange={handleTableChange}
//       pagination={{
//         showSizeChanger: true,
//         pageSizeOptions: ["10", "25", "50", "100"],
//         current: pagination?.page || 1,
//         pageSize: pagination?.limit || 10,
//         total: pagination?.total || 0,
//         showTotal: (total, range) =>
//           `Showing ${range[0]}-${range[1]} of ${total} items`,
//         itemRender: itemRender,
//         onShowSizeChange: onShowSizeChange,
//         position: ["bottomCenter"],
//         showQuickJumper: false,
//       }}
//     />
//   );
// };

// export default Datatable;

