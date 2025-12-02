using AutoMapper;
using BSE.DTOs;
using BSE.Entities;

namespace BSE.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Blog mappings
        CreateMap<Blog, BlogResponse>()
            .ForMember(dest => dest.AuthorName, opt => opt.MapFrom(src => src.Author.FullName))
            .ForMember(dest => dest.AuthorEmail, opt => opt.MapFrom(src => src.Author.Email))
            .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.Images));

        // BlogImage mappings
        CreateMap<BlogImage, BlogImageResponse>();
    }
}
