import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";
// import sampleData from "@/db/sample-data";

export const metadata = {
  title: "Home",
};

const Homepage = async () => {
  const latestProducts = await getLatestProducts();

  return (
    <>
      <ProductList
        data={latestProducts}
        title="Nouvelle Collection"
        subtitle="Découvrez nos créations uniques inspirées par l'environnement et confectionnées avec soin dans des matières nobles."
        limit={4}
      />
    </>
  );
};

export default Homepage;
