using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Group13_iCAREAPP.Models
{
    public class WorkerGeoCode
    {
        [Key]
        [Column(Order = 0)]
        public string geoID { get; set; }

        [Key]
        [Column(Order = 1)]
        public string workerID { get; set; }

        [ForeignKey("geoID")]
        public virtual GeoCodes GeoCode { get; set; }

        [ForeignKey("workerID")]
        public virtual iCAREUser Worker { get; set; }
    }
}
