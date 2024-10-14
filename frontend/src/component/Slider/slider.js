import React from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { useState, useEffect } from "react";
import axios from "axios"

const Slider = () => {
const [currentSlide, setCurrentSlide] = useState(0);
const [products, setProducts] = useState();
const slideLength = products?.length;

const autoScroll = true
let slideInterval;
let intervalTime = 5000;

const nextSlide = () => {
    setCurrentSlide(currentSlide === slideLength - 1 ? 0 :
        currentSlide + 1)
}

const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? slideLength - 1 : 
        currentSlide - 1)
}

function auto() {
    slideInterval = setInterval(nextSlide, intervalTime)
}

useEffect(() => {
   if (autoScroll) {
    auto()
   }
   return () => clearInterval(slideInterval)
},[currentSlide, slideInterval, autoScroll, auto ])

useEffect(() => {
  setCurrentSlide(0)
},[])

useEffect(() => {
    getproduct();
 }, [])
 
 async function getproduct(){
 const config = {
  headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
  }
};
const { data } = await axios.get("https://mernstack-ecommerce-aed74c62c080.herokuapp.com/api/v1/products",
config
)
setProducts(data.products)
}

return (
    <div className="slider">
        <AiOutlineArrowLeft className="arrow prev" onClick={prevSlide} />
        <AiOutlineArrowRight className="arrow next" onClick={nextSlide} />
        {
            products?.map((slide, index) => {
               const {images, description, name} = slide
                return (
                    <div key={index} className={index ===
                     currentSlide ? "slide current": "slide"}>
                       {index === currentSlide && (console.log(images[0].url, "images-"),
                          <>
                             <img src={images[0].url} alt="" />
                             <div className="content">
                                <h2>{name}</h2>
                                <p>{description}</p>
                             </div>                         
                          </>
                       )}
                    </div>
                )
            })
        }
    </div>
    )
}


export default Slider; 