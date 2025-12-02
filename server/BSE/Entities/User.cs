using System.ComponentModel.DataAnnotations;

namespace BSE.Entities;

public class User
{
    public int Id { get; set; }
    [Required]
    public required string Email { get; set; }

    [Required]
    public required string HashedPassword { get; set; }

    [Required]
    public required string FullName { get; set; }

    [Required]

    public required string Role { get; set; }
}