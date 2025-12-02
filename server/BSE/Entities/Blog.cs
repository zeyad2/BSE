using System.ComponentModel.DataAnnotations;

namespace BSE.Entities;


public class Blog
{
    public int Id { get; set; }
    
    public int AuthorId { get; set; }
    public User Author { get; set; }

    [Required]
    public required string Title { get; set; }

    [Required]
    public string Content { get; set; }



    public IEnumerable<BlogImage> Images { get; set; }


}