import './App.css';
import Header from "./component/layout/Header/Header.js";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import WebFont from "webfontloader";
import React from "react"; 
import axios from "axios";
import {useEffect, useState} from "react"; 
import Footer from "./component/layout/Footer/Footer";
import Home from "./component/Home/Home";
import ProductDetails from "./Product/ProductDetails";
import Products from "./Product/Products";
import Search from "./Product/Search";
import LoginSignUp from "./component/User/LoginSignUp";
import { loadUser, updateUser } from "./actions/userAction";
import store from "./store";
import UserOptions from './component/layout/Header/UserOptions';
import { useSelector } from 'react-redux';
import Profile from "./component/User/Profile";
import ProtectedRoute from './component/Route/ProtectedRoute';
import EnsureAuth from './component/Route/EnsureAuth';
import UpdateProfile from './component/User/UpdateProfile';
import UpdatePassword from './component/User/UpdatePassword';
import ForgotPassword from "./component/User/ForgotPassword";
import ResetPassword from "./component/User/ResetPassword";
import Cart from "./component/Cart/Cart";
import Shipping from "./component/Cart/Shipping";
import ConfirmOrder from "./component/Cart/ConfirmOrder";
import OrderSuccess from "./component/Cart/OrderSuccess";
import MyOrders from "./component/Orders/MyOrders";
import OrderDetails from "./component/Orders/OrderDetails";
import Dashboard from "./component/Admin/Dashboard";
import ProductList from "./component/Admin/ProductList";
import NewProduct from "./component/Admin/NewProduct";
import UpdateProduct from "./component/Admin/UpdateProduct";
import OrderList from "./component/Admin/OrderList";
import ProcessOrder from "./component/Admin/ProcessOrder";
import UserList from "./component/Admin/UserList";
import UpdateUser from "./component/Admin/UpdateUser";
import ProductReviews from "./component/Admin/ProductReviews";
import NotFound from "./component/layout/NotFound/NotFound";
function App() {
  const {isAuthenticated, user} = useSelector((state) =>state.user)
  
 
  useEffect(() => {
    WebFont.load({
      google:{
        families:["Roboto", "Droid Sans", "Chilanka"]
      }
    });

    store.dispatch(loadUser());
  }, [])
 
  window.addEventListener("contextmenu", (e) => e.preventDefault());

  return(
  <Router>
        <Header />
        {isAuthenticated && <UserOptions user={user}/>} 
        <Switch>      
       <Route exact path="/" component={Home} />
       <Route exact path="/product/:id" component={ProductDetails} />
       <Route exact path="/products" component={Products} />
       <Route path="/products/:keyword" component={Products} />
       <Route exact path="/search" component={Search} />
       <Route exact path="/login" component={LoginSignUp} />  
       <Route 
       exact 
       path="/password/forgot" 
       component={ForgotPassword} />
       <Route exact
       path="/password/reset/:token"
       component={ResetPassword} />
       <Route exact path="/cart" component={Cart} />
       <ProtectedRoute exact path="/me/update" component={UpdateProfile} />
       <ProtectedRoute exact path="/account" component={Profile} /> 
       <ProtectedRoute exact path="/password/update" component={UpdatePassword} />
       <ProtectedRoute exact path="/shipping" component={Shipping} />
       <EnsureAuth exact path="/success" component={OrderSuccess} />  
       <ProtectedRoute exact path="/orders" component={MyOrders} />  
       <ProtectedRoute exact path="/order/confirm" component={ConfirmOrder} /> 
       <ProtectedRoute exact path="/order/:id" component={OrderDetails} /> 
       <ProtectedRoute exact isAdmin={true} path="/admin/dashboard" component={Dashboard} />
       <ProtectedRoute exact path="/admin/products" isAdmin={true} component={ProductList} /> 
       <ProtectedRoute exact path="/admin/product" isAdmin={true} component={NewProduct} /> 
       <ProtectedRoute exact path="/admin/product/:id" isAdmin={true} component={UpdateProduct} /> 
       <ProtectedRoute exact path="/admin/orders" isAdmin={true} component={OrderList} /> 
       <ProtectedRoute exact path="/admin/order/:id" isAdmin={true} component={ProcessOrder} /> 
       <ProtectedRoute exact path="/admin/users" isAdmin={true} component={UserList} /> 
       <ProtectedRoute exact path="/admin/user/:id" isAdmin={true} component={UpdateUser} /> 
       <ProtectedRoute exact path="/admin/reviews" isAdmin={true} component={ProductReviews} /> 
       <Route
          component={NotFound}
        /> 
        </Switch>
       <Footer />
    </Router>
  )
} 

export default App;
