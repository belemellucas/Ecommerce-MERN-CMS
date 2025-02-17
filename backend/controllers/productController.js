//import akashaTech from "../services/akashaTech"
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const ApiFeatures = require("../utils/apifeatures"); 
const Product = require("../models/productModel");
const cloudinary = require("cloudinary");
 


/* shopify
// webhook shopify
exports.webhookShopify = catchAsyncErrors(async (req, res, next) => {
  productsWebhook()
  
  function productsWebhook(){
    const products = {
        _id: req.body.id
    }
     //const userId = webhookData.user_id;
  
    Product.findOne(products, (error, result) =>{
        if(error) {
            return console.log('Erro')
        }
        if(result) {
            console.log('produto já existe',result)
        } else {
            addProducts()
            async function addProducts(){
                await axios.post('http://localhost:4000/api/v1/admin/product/new', products);
              
            }
        }
    })
  }
})  

// products shopify
exports.getProductsShopify = catchAsyncErrors(async (req, res, next ) => {
    
    let request = require('request')

    let endpoint = 'products'
    
    let options = { 
        'method': 'GET',
        'url': `https://${apiKey}:${tokenAdmin}@akasha-technology-6995.myshopify.com/admin/api/2023-01/${endpoint}.json`,
        'headers': {
            'Content-type': 'application/json'
        }
    }

    request(options, function (error, response) {
        if (error) throw new Error(error);
        const resposta = JSON.parse(response.body); 
        const products = resposta.products;

       for(let i =0; i < products.length; i++){
           const addProduct = new Product({
                _id: products[i]['id']
            })
            addProduct.save();
        }
        res.status(201).json({
            success: true, 
            products
        }); 
    });

});  

// Create Product Shopify
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    
    let request = require('request')

    let endpoint = 'products'
    
    let options = { 
        'method': 'POST',
        'url': `https://${apiKey}:${tokenAdmin}@akasha-technology-6995.myshopify.com/admin/api/2023-01/${endpoint}.json`,
        'headers': {
            'Content-type': 'application/json'
        }
    }
    let products;
    request(options, function (error, response) {
        if (error) throw new Error(error);
         products = response.body; 
    })
    for(let i =0; i < products.length; i++) {
        const addproducts = new Product({
           _id: products[i]['id']
        });
        addproducts.save();
    }
}) */

// Create Product -- Admin -- Old

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});


// Get All Product 
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = 4;
    const productsCount = await Product.countDocuments();
    console.log(req.query, "REQ QUERY")
    const apiFeature = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter();
  
    let products = await apiFeature.query;
    
    let filteredProductsCount = products.length;
  
    apiFeature.pagination(resultPerPage);
    
   //products = products = await apiFeature.query;

  
    res.status(200).json({
      success: true,
      products,
      productsCount,
      resultPerPage,
      filteredProductsCount,
    });
  });

// Get All Product (Admin) 
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
   const products = await Product.find();
  
    res.status(200).json({
      success: true,
      products
    });
  });


//Get Product Details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id); 

    if(!product){ 
      return next(new ErrorHander("Product not found",404))
    }  

    res.status(200).json({
        success: true, 
        product
    })
})

// Update Product -- Admin  
exports.updateProduct = catchAsyncErrors(async (req, res, next ) => {
    let product = await Product.findById(req.params.id); 

    if(!product) {
     return next(new ErrorHander("Product not found", 404)); 
    }

    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    if(images !== undefined){
        for(let i = 0; i < product.images.length; i++) {
          await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

    const imagesLinks = [];

    for(let i = 0; i < images.length; i++){
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });

        imagesLinks.push({
            public_id: result.public_id, 
            url: result.secure_url,
        });
     }
     req.body.images = imagesLinks;
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators: true, 
        useFindAndModify: false 
    }); 

    res.status(200).json({
        success: true,
        product 
    })
})

// Delete Product 

exports.deleteProduct = catchAsyncErrors(async(req, res, next) => {
    const product = await Product.findById(req.params.id); 

    if(!product) {
        return res.status(500).json({
            success: false, 
            message: "Product not found"
        })
    }
    
    for(let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(
            product.images[i].public_id);
    }

    await product.remove(); 

    res.status(200).json({
        success: true, 
        message:"Product Delete Succesfully"
    })
})


//Create New Review or Update the review 

exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id, 
        name: req.user.name, 
        rating: Number(rating), 
        comment, 
    }; 

    const product = await Product.findById(productId); 
      
    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString()===req.user._id.toString())

    if(isReviewed){
        product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
           (rev.rating = rating), (rev.comment = comment); 
        }); 
    }else{
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    let avg=0; 


    product.reviews.forEach((rev) => {
        avg += rev.rating; 
    })
    product.rating = avg
    / product.reviews.length; 

    await product.save({ validateBeforeSave: false }); 
    
    res.status(200).json({
        success: true, 
    }); 
}); 

//Get All Reviews of a product 
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id); 

    if(!product) {
        return next(new ErrorHander("Product not found", 404)); 
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews, 
    });
}); 


// Delete Review 
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId); 
    
    if(!product) {
        return next(new ErrorHander("Product not Found", 404))
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    ); 
    let avg = 0;

    reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    let ratings = 0;
  
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    } 

    const numOfReviews = reviews.length;
    
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews, 
        ratings, 
        numOfReviews, 
    },
    {
        new: true, 
        runValidators: true, 
        useFindAndModify: false, 
    })

    res.status(200).json({
        success: true, 
    }); 
})