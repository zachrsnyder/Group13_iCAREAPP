// In /ViewModels/PatientCreateModel.cs

using System.ComponentModel.DataAnnotations;

namespace Group13_iCAREAPP.ViewModels
{
    public class PatientCreateModel
    {
        [Required]
        public string name { get; set; }

        [Required]
        public string address { get; set; }

        [Required]
        public string dateOfBirth { get; set; }

        [Required]
        public string height { get; set; }

        [Required]
        public string weight { get; set; }

        [Required]
        public string bloodGroup { get; set; }

        [Required]
        public string bedID { get; set; }

        [Required]
        public string treatmentArea { get; set; }

        [Required]
        public string assignedUserID { get; set; }
    }
}