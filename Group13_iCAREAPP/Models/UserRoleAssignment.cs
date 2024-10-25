namespace Group13_iCAREAPP.Models
{
    public partial class UserRoleAssignment
    {
        public string userID { get; set; }
        public string roleID { get; set; }

        public virtual iCAREUser User { get; set; }
        public virtual UserRole Role { get; set; }
    }
}