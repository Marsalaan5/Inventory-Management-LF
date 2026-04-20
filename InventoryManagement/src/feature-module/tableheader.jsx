// components/TableHeader.jsx
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { RotateCcw } from 'feather-icons-react/build/IconComponents';
import ImageWithBasePath from '../core/img/imagewithbasebath';
import { exportPDF, exportExcel, refreshData } from '../utils/exports';
import { DateTime } from 'luxon';

/**
 * Reusable Table Header Actions Component
 * 
 * @param {Object} props
 * @param {Function} props.onRefresh - Function to refresh data
 * @param {string} props.pdfEndpoint - PDF export API endpoint
 * @param {string} props.excelEndpoint - Excel export API endpoint
 * @param {object} props.filters - Current filters to pass to export
 * @param {string} props.entityName - Name of entity for filename (e.g., 'products', 'users', 'warehouses')
 * @param {Function} props.dispatch - Redux dispatch function
 * @param {boolean} props.headerState - Current header toggle state
 * @param {Function} props.headerAction - Redux action for header toggle
 * @param {boolean} props.showPdf - Show PDF button (default: true)
 * @param {boolean} props.showExcel - Show Excel button (default: true)
 * @param {boolean} props.showPrint - Show Print button (default: false)
 */
const TableHeaderActions = ({
  onRefresh,
  pdfEndpoint,
  excelEndpoint,
  filters = {},
  entityName = 'data',
  // dispatch,
  // headerState,
  // headerAction,
  showPdf = true,
  showExcel = true,
  // showPrint = false,
}) => {
  const renderTooltip = (text) => {
    const TooltipComponent = (props) => (
      <Tooltip id={`${text}-tooltip`} {...props}>
        {text}
      </Tooltip>
    );
    TooltipComponent.displayName = `Tooltip-${text}`;
    return TooltipComponent;
  };

  const handlePDFExport = () => {
    const timestamp = DateTime.local().toFormat('yyyy-MM-dd');
    exportPDF(pdfEndpoint, `${entityName}-${timestamp}.pdf`, filters);
  };

  const handleExcelExport = () => {
    const timestamp = DateTime.local().toFormat('yyyy-MM-dd');
    exportExcel(excelEndpoint, `${entityName}-${timestamp}.xlsx`, filters);
  };

  const handleRefresh = () => {
    refreshData(onRefresh);
  };

  // const handleToggleHeader = () => {
  //   toggleHeader(dispatch, headerState, headerAction);
  // };

  return (
    <ul className="table-top-head">
      {showPdf && (
        <li>
          <OverlayTrigger placement="top" overlay={renderTooltip('PDF')}>
            <Link onClick={handlePDFExport}>
              <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="PDF" />
            </Link>
          </OverlayTrigger>
        </li>
      )}
      
      {showExcel && (
        <li>
          <OverlayTrigger placement="top" overlay={renderTooltip('Excel')}>
            <Link onClick={handleExcelExport}>
              <ImageWithBasePath src="assets/img/icons/excel.svg" alt="Excel" />
            </Link>
          </OverlayTrigger>
        </li>
      )}
      
      {/* {showPrint && (
        <li>
          <OverlayTrigger placement="top" overlay={renderTooltip('Print')}>
            <Link onClick={() => window.print()}>
              <i data-feather="printer" className="feather-printer" />
            </Link>
          </OverlayTrigger>
        </li>
      )} */}
      
      <li>
        <OverlayTrigger placement="top" overlay={renderTooltip('Refresh')}>
          <Link onClick={handleRefresh}>
            <RotateCcw />
          </Link>
        </OverlayTrigger>
      </li>
      
      {/* <li>
        <OverlayTrigger placement="top" overlay={renderTooltip('Collapse')}>
          <Link 
            className={headerState ? 'active' : ''} 
            onClick={handleToggleHeader}
          >
            <ChevronUp />
          </Link>
        </OverlayTrigger>
      </li> */}
    </ul>
  );
};



TableHeaderActions.propTypes = {
  onRefresh: PropTypes.func,
  pdfEndpoint: PropTypes.string,
  excelEndpoint: PropTypes.string,
  filters: PropTypes.object,
  entityName: PropTypes.string,
  dispatch: PropTypes.func,
  headerState: PropTypes.object,
  headerAction: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  showPdf: PropTypes.bool,
  showExcel: PropTypes.bool,
  showPrint: PropTypes.bool,
};

export default TableHeaderActions;