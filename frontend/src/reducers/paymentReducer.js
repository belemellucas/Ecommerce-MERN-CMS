import {
    STATUS_ORDER_SUCCEEDED 
} from "../constants/paymentConstants";

export const statusPayment = (state = {}, action) => {
    switch(action.type) {
     case STATUS_ORDER_SUCCEEDED:
       return {
         ...state,
         loading: true,
       };
    
     default:
         return state;
    }
 };