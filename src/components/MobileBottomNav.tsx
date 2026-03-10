import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, Layers, Star, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { to: "/sorteios", icon: Trophy, label: "Sorteios" },
    { to: "/nfts", icon: Layers, label: "NFTs" },
    { to: "/", icon: Home, label: "Início", center: true },
    { to: "/winners", icon: Star, label: "Ganhadores" },
    { to: "/como-funciona", icon: Menu, label: "Menu" },
];

const MobileBottomNav: React.FC = () => {
    const location = useLocation();

    return (
        <nav className="mobile-bottom-nav">
            {navItems.map(({ to, icon: Icon, label, center }) => {
                const isActive =
                    to === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(to);

                if (center) {
                    return (
                        <Link key={to} to={to} className="mobile-nav-center-item">
                            <span className={cn("mobile-nav-center-bubble", isActive && "active")}>
                                <Icon className="mobile-nav-center-icon" />
                            </span>
                            <span className={cn("mobile-nav-label", isActive && "active-label")}>{label}</span>
                        </Link>
                    );
                }

                return (
                    <Link key={to} to={to} className={cn("mobile-nav-item", isActive && "active")}>
                        <Icon className="mobile-nav-icon" />
                        <span className="mobile-nav-label">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default MobileBottomNav;
