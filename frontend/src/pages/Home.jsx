import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import ProductCatalog from "../components/ProductCatalog";

function Home() {
  const [auth, setAuth] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/")
      .then(res => {
        if (res.data?.status === "Success") {
          setAuth(true);
          setName(res.data.name);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {!loading && (
        <div style={{ padding: 20 }}>
          {auth ? (
            <p>Welcome, {name}! <Link to="/profile">Profile</Link></p>
          ) : (
            <p>
              You are not logged in. <Link to="/login">Login</Link>
            </p>
          )}
        </div>
      )}

      <ProductCatalog />
    </div>
  );
}

export default Home;
