﻿

//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------


namespace Group13_iCAREAPP.Models
{

using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;


public partial class Group13_iCAREDBEntities : DbContext
{
    public Group13_iCAREDBEntities()
        : base("name=Group13_iCAREDBEntities")
    {

    }

    protected override void OnModelCreating(DbModelBuilder modelBuilder)
    {
        throw new UnintentionalCodeFirstException();
    }


    public virtual DbSet<DocumentMetadata> DocumentMetadata { get; set; }

    public virtual DbSet<DocumentStorage> DocumentStorage { get; set; }

    public virtual DbSet<iCAREUser> iCAREUser { get; set; }

    public virtual DbSet<ModificationHistory> ModificationHistory { get; set; }

    public virtual DbSet<PatientGeoCode> PatientGeoCode { get; set; }

    public virtual DbSet<PatientRecord> PatientRecord { get; set; }

    public virtual DbSet<TreatmentRecord> TreatmentRecord { get; set; }

    public virtual DbSet<UserPassword> UserPassword { get; set; }

    public virtual DbSet<UserRole> UserRole { get; set; }

    public virtual DbSet<WorkerGeoCode> WorkerGeoCode { get; set; }

}

}

