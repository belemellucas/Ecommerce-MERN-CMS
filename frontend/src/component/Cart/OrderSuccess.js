import React from "react";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import "./orderSuccess.css";
import { Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useEffect, useState, Fragment } from "react";
import axios from "axios"; 
import { useSelector, useDispatch } from "react-redux";
import { createOrder, clearErrors } from "../../actions/orderAction";

const OrderSuccess = ({children}) => {
    const { shippingInfo, cartItems } = useSelector((state) => state.cart)
    const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo"));
    const [statusPayment, setStatusPayment] = useState();
    const dispatch = useDispatch();
    const order = {
      shippingInfo,
      orderItems: cartItems,
      itemsPrice: orderInfo.subtotal,
      taxPrice: orderInfo.tax, 
      shippingPrice: orderInfo.shippingCharges,
      totalPrice: orderInfo.totalPrice
    }
  
    useEffect(() => {
       const urlParams = new URLSearchParams(window.location.search);
       const sessionId = urlParams.get('session_id');
       if (sessionId) {
        axios.get(`${process.env.REACT_APP_API_URL}/api/v1/confirmPayment/${sessionId}`)
          .then(response => {
            setStatusPayment(response.data);
            if(response.data && response.data.status === "succeeded"){
                order.paymentInfo = {
                  id: response.data.id,
                  status: response.data.status
                };
                dispatch(createOrder(order));
            }
          })
          .catch(error => {
            console.error('Erro ao buscar dados de pagamento:', error);
          });
    }
    }, []);

    return ( 
          <Fragment>
           <div className="orderSuccess">
            <CheckCircleIcon />
            <Typography>Your Ordeer has been Placed successfully</Typography>
            <Link to="/orders">View Orders</Link>
           </div>
          </Fragment>
    );
};

export default OrderSuccess;