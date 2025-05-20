import { Link } from "react-router-dom";
import NavBar from "../features/navbar/Navbar";
import ProductList from "../features/product/components/ProductList";
import Footer from "../features/common/Footer";
import ProductCarousel from "../features/carousel/ProductCarousel";
import {useSelector} from 'react-redux'


function Home() {

     const { searchQuery } = useSelector((state) => state.product);
    return ( 
        <div>
            <NavBar> 
                {!searchQuery && <ProductCarousel/>}
                <ProductList></ProductList>
            </NavBar>
            <Footer></Footer>
        </div>
     );
}

export default Home;