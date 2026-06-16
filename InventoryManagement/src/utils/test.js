


1. status === 'closed'
2. status === 'rejected'
3. delivered_at !== null && grn_timestamp !== null
4. grn_timestamp !== null && delivered_at === null
5. delivered_at !== null && grn_timestamp === null


6. status=in-fulfillment && stock_id !== null && sf_submitted_at !== null

7. status=in-fulfillment && stock_id !== null && sf_submitted_at === null


8. status=in-fulfillment && stock_id === null

// planned but stock id not generated yet 
9. status=planned 

// planned and schedule but never dispatched
10. status=planned && scheduled_dispatch !==null

11. resolution_required_email_uuids !== null

12. status=approved && dispatch_given_at !== null && stock_id === null

13. status=approved && stock_id === null && deadline_notice_at !== null

14. status=approved && stock_id === null&& deadline_notice_at === null

15. status=approved && stock_id !== null 

16. status=pending && escalation_enabled=1 && escalation_email_uuids !== null

17. status=pending && follow_up_enabled=1 && follow_up_email_uuids !== null

18. status=pending






if (curr_req.status === "rejected") {
                    req_status = "Rejected";
                    action_required = "No Action";
                   
                } else if (curr_req.delivered_at !== null && curr_req.grn_timestamp !== null) {
					// For Supplier and Recipient
					req_status = "Request Closed";
					action_required = "No Action"; 

					// For Supplier; Review Discrepancy - Only if the Recipient reported receiving fewer items than you sent.
				} else if (curr_req.delivered_at !== null && curr_req.grn_timestamp === null) {
					// For Supplier and Recipient
					req_status = "Delivered";

					// For Supplier - "Awaiting Receipt Finalization"; 
					// For Recipient - "Finalise Receipt";
					action_required = curr_req.is_requester ? "Finalise Receipt" : "Awaiting Receipt Finalization";
				} 
				else if (curr_req.status === "in-fulfillment" && curr_req.submitted_at !== null) {
   
					req_status = "In-Transit";
					action_required = curr_req.is_requester ? "Track Shipment" : "Monitor Delivery";

				} else if (curr_req.resolution_required_email_uuids !== null && curr_req.resolution_required_enabled === 1 ) {
					// For Supplier and Recipient
					req_status = "Resolution required";
					action_required = "Reschedule / Cancel"; 

				} else if (
					curr_req.escalation_enabled === 1 &&
					curr_req.escalation_email_uuids !== null
				) {
					// For Supplier and Recipient
					req_status = "Matter Escalated";

					// For Supplier - "Immediate Action Required"; 
					// For Recipient - "Contact Admin"; 
					action_required = curr_req.is_requester ? "Contact Admin" : "Immediate Action Required";
				}
				else if (
					curr_req.deadline_notice_at !== null
				) {
					// For Supplier and Recipient
					req_status = "Shipping Deadline Approaching";

					// For Supplier - "Pick & Dispatch Now";
					// For recipient - "Prep Receiving Slot"; 
					action_required = curr_req.is_requester ? "Prep Receiving Slot" : "Pick & Dispatch Now";

				} else if (curr_req.status === "in-fulfillment" && curr_req.submitted_at === null) {
					
					req_status = "Preparing Shipment";
					action_required = curr_req.is_requester ? "Await Dispatch" : "Finalise & Submit Shipment";

				} else if (curr_req.status === "planned" && curr_req.stock_id === null) {

					

					// same as above
					req_status = "Dispatch Planned";
					action_required = curr_req.is_requester ? "Await Dispatch" : "Create & Submit Shipment";

				} else if (  curr_req.status === "approved" && 
					curr_req.follow_up_enabled === 1 &&
					curr_req.follow_up_email_uuids !== null) {

					
					{
					req_status = "Awaiting Dispatch — Follow-Up Sent";
					action_required = curr_req.is_requester
						? "Monitor Progress"   
						: "Plan Dispatch Urgently";
				}

				} else if (curr_req.status === "approved" && curr_req.scheduled_dispatch === null) {

					

					// For Supplier - "Scheduled";
					// For recipient - "Awaiting Shipment";
				

					req_status = "Action Required";   

					action_required = curr_req.is_requester
						? "Awaiting Supplier Action" 
						: "Plan & Schedule Dispatch"; 

					}  else if (
						curr_req.status === "pending" &&
						curr_req.follow_up_enabled === 1 &&
						curr_req.follow_up_email_uuids !== null
					) {
						req_status = "Followed Up — Awaiting Approval";
						action_required = curr_req.is_requester
							? "Monitor for Response"
							: "Prioritise Review";

					} else if (curr_req.status === "pending") {
						req_status = "Pending for Approval";
						action_required = curr_req.is_requester
							? "Awaiting Confirmation"
							: "Review & Approve";
					}