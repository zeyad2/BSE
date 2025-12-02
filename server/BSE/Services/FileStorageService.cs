namespace BSE.Services;

public class FileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly long _maxFileSize = 5 * 1024 * 1024; // 5 MB
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

    public FileStorageService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> SaveFileAsync(IFormFile file, string folder)
    {
        // Validate file
        ValidateFile(file);

        // Generate unique filename
        var fileName = GenerateUniqueFileName(file.FileName);

        // Get web root path (use ContentRootPath if WebRootPath is null)
        var webRootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");

        // Ensure directory exists
        var uploadPath = Path.Combine(webRootPath, "uploads", folder);
        Directory.CreateDirectory(uploadPath);

        // Save file
        var filePath = Path.Combine(uploadPath, fileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Return URL path
        return $"/uploads/{folder}/{fileName}";
    }

    public async Task<List<string>> SaveFilesAsync(IFormFileCollection files, string folder)
    {
        var urls = new List<string>();

        foreach (var file in files)
        {
            var url = await SaveFileAsync(file, folder);
            urls.Add(url);
        }

        return urls;
    }

    public Task DeleteFileAsync(string fileUrl)
    {
        try
        {
            // Get web root path (use ContentRootPath if WebRootPath is null)
            var webRootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");

            // Extract relative path from URL
            var relativePath = fileUrl.TrimStart('/');
            var filePath = Path.Combine(webRootPath, relativePath);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
        catch (Exception)
        {
            // Log error but don't throw - file deletion is not critical
        }

        return Task.CompletedTask;
    }

    private void ValidateFile(IFormFile file)
    {
        // Check if file is empty
        if (file.Length == 0)
        {
            throw new InvalidOperationException("File is empty");
        }

        // Check file size
        if (file.Length > _maxFileSize)
        {
            throw new InvalidOperationException($"File size exceeds maximum allowed size of {_maxFileSize / 1024 / 1024} MB");
        }

        // Check file extension
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException($"File type '{extension}' is not allowed. Allowed types: {string.Join(", ", _allowedExtensions)}");
        }
    }

    private string GenerateUniqueFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName);
        var uniqueId = Guid.NewGuid().ToString("N");
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        return $"{timestamp}_{uniqueId}{extension}";
    }
}
