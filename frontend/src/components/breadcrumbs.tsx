import { Link, useLocation } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

export function AppBreadcrumbs() {
    const { pathname } = useLocation();
    const parts = pathname.split("/").filter(Boolean);
    const crumbs = parts.map((p, i) => ({
        label: format(p),
        to: "/" + parts.slice(0, i + 1).join("/"),
    }));

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/dashboard">Inicio</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {crumbs.map((c) => (
                    <Fragment key={c.to}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild><Link to={c.to}>{c.label}</Link></BreadcrumbLink>
                        </BreadcrumbItem>
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

function format(seg: string) {
    // /events/:id -> "Events", ids no se muestran como :id
    if (!isNaN(Number(seg))) return `#${seg}`;
    return seg.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
