import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        const isActivated = searchParams.get("isActivated") === "true";

        if (token) {
            localStorage.setItem("auth_token", token);

            if (isActivated) {
                navigate("/");
            } else {
                navigate("/?setup=true");
            }
        } else {
            navigate("/");
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse">Autenticando...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
