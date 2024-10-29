using System.Web.Mvc;
using System.Web.Routing;

public class RouteConfig
{
    public static void RegisterRoutes(RouteCollection routes)
    {
        routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

        // Enable attribute routing
        routes.MapMvcAttributeRoutes();


        routes.MapRoute(
            name: "Default",
            url: "{controller}/{action}/{id}",
            defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
        );

        routes.MapRoute(
            name: "DeleteUser",
            url: "Admin/DeleteUser",
            defaults: new { controller = "Admin", action = "DeleteUser" }
        );
    }
}