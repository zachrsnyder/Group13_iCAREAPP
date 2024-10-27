using System.Web.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.IO;
using System;

namespace Group13_iCAREAPP.Models
{
    public class JsonModelBinder : IModelBinder
    {
        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            try
            {
                var request = controllerContext.HttpContext.Request;
                // Read the JSON from the request body
                using (var reader = new StreamReader(request.InputStream))
                {
                    reader.BaseStream.Position = 0;
                    var json = reader.ReadToEnd();

                    if (string.IsNullOrEmpty(json))
                        return null;

                    // Convert the JSON directly to the target type instead of JObject
                    return JsonConvert.DeserializeObject(json, bindingContext.ModelType);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"JSON Model Binding Error: {ex.Message}");
                return null;
            }
        }
    }
}