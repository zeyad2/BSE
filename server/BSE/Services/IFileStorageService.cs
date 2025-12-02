namespace BSE.Services;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(IFormFile file, string folder);
    Task<List<string>> SaveFilesAsync(IFormFileCollection files, string folder);
    Task DeleteFileAsync(string fileUrl);
}
