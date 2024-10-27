using System;
using System.ComponentModel.DataAnnotations;

namespace Group13_iCAREAPP.Models
{
    public class DocumentStorage
    {
        [Key]
        public string Id { get; set; }  // Changed to string to match your GUID usage
        public byte[] FileData { get; set; }  // Assuming FileData is binary data
    }
}