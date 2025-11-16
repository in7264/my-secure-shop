import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import EquipmentList from "./pages/EquipmentList";
import AdminPanel from "./pages/AdminPanel";
import "./styles/App.scss";

export default function App() {
  const [user, setUser] = useState<any>(null);

  return (
    <Router>
      <MainApp user={user} setUser={setUser} />
    </Router>
  );
}

function MainApp({ user, setUser }: { user: any; setUser: any }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Отримати поточного користувача
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      checkRoleAndRedirect(session?.user);
    });

    // Слухати зміни авторизації
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const newUser = session?.user ?? null;
        setUser(newUser);
        checkRoleAndRedirect(newUser);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const checkRoleAndRedirect = async (user: any) => {
    if (!user) return;

    // Отримати роль користувача з бази
    const { data, error } = await supabase
      .from("auth.users") // або auth.users, якщо поле role є саме там
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Помилка отримання ролі:", error);
      return;
    }

    if (data?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <>
      <nav>
        <div>
          <Link to="/">Головна</Link> | <Link to="/equipment">Каталог</Link> |{" "}
          <Link to="/auth">Авторизація</Link>
        </div>

        <div className="user-info">
          {user ? (
            <>
              <span>👤 {user.email}</span>
              <button onClick={handleLogout}>Вийти</button>
            </>
          ) : (
            <Link to="/auth">Увійти</Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/equipment" element={<EquipmentList />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </>
  );
}
