import React from 'react'
import { ReactNavbar } from "overlay-navbar"; 
import logo from "../../../images/akashatech.png";
import {FaUserAlt} from "react-icons/fa";
import {BsSearch} from "react-icons/bs";
import {BsFillBagFill} from "react-icons/bs";

const Header = () => {

 const options = {
  burgerColorHover: "#eb4034",
  logo,
  logoWidth: "20vmax",
  navColor1: "white",
  logoHoverSize: "10px",
  logoHoverColor: "#eb4034",
  link1Text: "Home",
  link2Text: "Products",
  link3Text: "Contact",
  link4Text: "About",
  link1Url: "/",
  link2Url: "/products",
  link3Url: "/contact",
  link4Url: "/about",
  link1Size: "1.3vmax",
  link1Color: "rgba(35, 35, 35,0.8)",
  nav1justifyContent: "flex-end",
  nav2justifyContent: "flex-end",
  nav3justifyContent: "flex-start",
  nav4justifyContent: "flex-start",
  nav4justifyContent: "space-evenly",

  link1ColorHover: "#eb4034",
  link1Margin: "1vmax",
  profileIconUrl: "/login",
  profileIconColor: "rgba(35, 35, 35,0.8)",
  searchIconColor: "rgba(35, 35, 35,0.8)",
  cartIconColor: "rgba(35, 35, 35,0.8)",
  profileIconColorHover: "#eb4034",
  searchIconColorHover: "#eb4034",
  cartIconColorHover: "#eb4034",
  cartIconMargin: "1vmax", 
  profileIcon:"true",
  ProfileIconElement:FaUserAlt,
  searchIcon:"true",
  SearchIconElement:BsSearch,
  cartIcon:"true", 
  CartIconElement: BsFillBagFill
}
    return   <ReactNavbar {...options}  />
}


export default Header; 