import React, { Fragment, useEffect } from "react";
import CheckoutSteps from "../Cart/CheckoutSteps";
import { useSelector, useDispatch } from "react-redux";
import MetaData from "../layout/MetaData";
import "./ConfirmOrder.css";
import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core"; 
import { loadStripe } from "@stripe/stripe-js";
import { createOrder, clearErrors } from "../../actions/orderAction";

const ConfirmOrder = ({history}) => {
    const { shippingInfo, cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);
    const { error } = useSelector((state) => state.newOrder);
    const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo"));
    const dispatch = useDispatch();
    const subtotal = cartItems.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0
    );
    const shippingCharges = subtotal > 1000 ? 0 : 200;
    const tax = subtotal * 0.18;
    const totalPrice = subtotal + tax + shippingCharges;
    const address = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.pinCode}, ${shippingInfo.country}`;
    const makePayment = async ()=> {
        const stripe = await loadStripe("pk_test_51OasoeG5zQl2LvKmMyA19zh4rd7LUiT1LT3vvNUQzzkTacGtGLysehjOOXT3tdrp72nXsWD23UzBJ7ShYf5217qq00IVfhUdrT")
        const body = {
          products: cartItems,
        }
        const headers = {
          "Content-Type":"application/json"
        }
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/create-checkout-session`, {
          method: "POST",
          headers:headers,
          body:JSON.stringify(body)
        })
        const session = await response.json();
        const result = stripe.redirectToCheckout({
          sessionId:session.id
        });
        if(result.error){
          alert.error(result.error.message);
        } 
      } 

    const proceedToPayment = () => {
        const data = {
            subtotal,
            shippingCharges,
            tax,
            totalPrice 
        }; 
        sessionStorage.setItem("orderInfo", JSON.stringify(data));
       makePayment();
    } 

    useEffect(() => {
        if(error) {
            alert.error(error);
            dispatch(clearErrors()); 
        }
    }, [dispatch,error,alert])

    return (
       <Fragment>
        <MetaData title="Confirm Order"/>
        <CheckoutSteps activeStep={1} />
        <div className="confirmOrderPage">
            <div>
                <div className="confirmshippingArea">
                    <Typography>Shipping Info</Typography>
                    <div className="confirmshippingAreaBox">
                        <div>
                            <p>Name:</p>
                            <span>{user.name}</span>
                        </div>
                        <div>
                            <p>Phone:</p>
                            <span>{shippingInfo.phoneNo}</span>
                        </div>
                        <div>
                            <p>Address:</p>
                            <span>{address}</span>
                        </div>
                    </div>
                </div>
                <div className="confirmCartItems">
                  <Typography>Your Cart Items:</Typography>
                   <div className="confirmCartItemsContainer">
                    {cartItems && 
                       cartItems.map((item) => (
                        <div key={item.product}>
                           <img src={item.image} alt="Product" />
                           <Link to={`/product/${item.product}`}>
                            {item.name}
                           </Link>{" "}
                           <span>
                            {item.quantity} X ${item.price} = {" "}
                            <b>${item.price * item.quantity}</b>
                           </span>
                        </div>
                       ))}
                   </div>
                </div>
            </div>
            { /* */}
            <div>
                <div className="orderSummary">
                   <Typography>Order Summery</Typography>
                <div>
                    <div>
                        <p>Subtotal:</p>
                        <span>${subtotal}</span>
                    </div>
                    <div>
                        <p>Shipping Charges:</p>
                        <span>${shippingCharges}</span>
                    </div>
                    <div>
                        <p>GST: </p>
                        <span>${tax}</span>
                    </div>
                </div>
                <div className="orderSummaryTotal">
                    <p>
                        <b>Total: </b>
                    </p>
                    <span>${totalPrice}</span>
                </div>
               <button onClick={proceedToPayment}>Proceed To Payment</button>
            </div>
        </div>
    </div>
       </Fragment>  
    ) 
   
}

export default ConfirmOrder