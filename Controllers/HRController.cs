using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace HRManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HRController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private string? _pageToken = null;
        
        // Lưu trữ bài đăng (tạm thời - trong production dùng database)
        private static Dictionary<string, FacebookPostInfo> _posts = new();
        private static string? _autoReplyMessage = null;

        public HRController(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;
        }

        // Helper: Đọc data.json
        private JsonDocument LoadData()
        {
            var dataPath = Path.Combine(AppContext.BaseDirectory, @"..\..\data.json");
            if (!System.IO.File.Exists(dataPath))
            {
                dataPath = Path.Combine(Directory.GetCurrentDirectory(), "data.json");
            }
            
            var jsonContent = System.IO.File.ReadAllText(dataPath);
            return JsonDocument.Parse(jsonContent);
        }

        // Helper: Lưu data.json
        private void SaveData(Dictionary<string, object> data)
        {
            var dataPath = Path.Combine(AppContext.BaseDirectory, @"..\..\data.json");
            if (!System.IO.File.Exists(dataPath))
            {
                dataPath = Path.Combine(Directory.GetCurrentDirectory(), "data.json");
            }

            var options = new JsonSerializerOptions { WriteIndented = true };
            var jsonContent = JsonSerializer.Serialize(data, options);
            System.IO.File.WriteAllText(dataPath, jsonContent);
        }

        // Lấy page token từ user token
        private async Task<string?> GetPageToken()
        {
            if (!string.IsNullOrEmpty(_pageToken))
                return _pageToken;

            try
            {
                var userToken = _configuration["Facebook:AccessToken"];
                var pageId = _configuration["Facebook:PageId"];

                if (string.IsNullOrEmpty(userToken))
                {
                    Console.WriteLine("ERROR: Facebook:AccessToken không được cấu hình trong appsettings.json");
                    return null;
                }

                if (string.IsNullOrEmpty(pageId))
                {
                    Console.WriteLine("ERROR: Facebook:PageId không được cấu hình trong appsettings.json");
                    return null;
                }

                Console.WriteLine($"Getting page token for PageId: {pageId}");
                
                // Gọi API /me/accounts để lấy danh sách page
                var url = $"https://graph.facebook.com/me/accounts?access_token={userToken}";
                Console.WriteLine($"Calling: {url}");
                
                var response = await _httpClient.GetAsync(url);
                var content = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"Response Status: {response.StatusCode}");
                Console.WriteLine($"Response Content: {content}");

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"ERROR: Facebook API returned {response.StatusCode}");
                    Console.WriteLine($"Full error: {content}");
                    return null;
                }

                using (JsonDocument doc = JsonDocument.Parse(content))
                {
                    var root = doc.RootElement;
                    if (root.TryGetProperty("data", out JsonElement data))
                    {
                        Console.WriteLine($"Found {data.GetArrayLength()} pages");
                        
                        foreach (var item in data.EnumerateArray())
                        {
                            if (item.TryGetProperty("id", out JsonElement id))
                            {
                                var currentId = id.GetString();
                                Console.WriteLine($"Checking page ID: {currentId}");
                                
                                if (currentId == pageId && 
                                    item.TryGetProperty("access_token", out JsonElement token))
                                {
                                    _pageToken = token.GetString();
                                    Console.WriteLine($"SUCCESS: Got page token for {pageId}");
                                    return _pageToken;
                                }
                            }
                        }
                        Console.WriteLine($"ERROR: Page {pageId} not found in accounts list");
                    }
                    else if (root.TryGetProperty("error", out JsonElement error))
                    {
                        Console.WriteLine($"Facebook Error: {error}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"EXCEPTION getting page token: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
            }

            return null;
        }

        [HttpPost("create-interview")]
        public IActionResult CreateInterview([FromBody] InterviewRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Title))
                return BadRequest("Thông tin buổi phỏng vấn không hợp lệ");

            try
            {
                var dataPath = Path.Combine(Directory.GetCurrentDirectory(), "data.json");
                var jsonContent = System.IO.File.ReadAllText(dataPath);
                
                // Deserialize to Dictionary
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var currentData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonContent, options) 
                    ?? new Dictionary<string, JsonElement>();

                var interview = new
                {
                    id = Guid.NewGuid().ToString(),
                    title = request.Title,
                    room = request.Room,
                    dateTime = request.DateTime,
                    participants = request.Participants ?? new string[0],
                    createdAt = DateTime.Now
                };

                // Lấy BuoiPhongVan array và convert sang List
                var buoiPhongVanList = new List<object>();
                if (currentData.ContainsKey("BuoiPhongVan"))
                {
                    foreach (var item in currentData["BuoiPhongVan"].EnumerateArray())
                    {
                        buoiPhongVanList.Add(JsonSerializer.Deserialize<object>(item.GetRawText()) ?? new object());
                    }
                }
                
                buoiPhongVanList.Add(interview);

                // Tạo data mới
                var newData = new Dictionary<string, object>();
                foreach (var kvp in currentData)
                {
                    if (kvp.Key == "BuoiPhongVan")
                    {
                        newData[kvp.Key] = buoiPhongVanList;
                    }
                    else
                    {
                        newData[kvp.Key] = JsonSerializer.Deserialize<object>(kvp.Value.GetRawText()) ?? new object();
                    }
                }

                SaveData(newData);

                return Ok(new
                {
                    success = true,
                    message = "Buổi phỏng vấn đã được tạo thành công",
                    data = interview
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating interview: {ex.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}");
                return BadRequest(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        [HttpGet("interviews")]
        public IActionResult GetInterviews()
        {
            try
            {
                var dataPath = Path.Combine(Directory.GetCurrentDirectory(), "data.json");
                var jsonContent = System.IO.File.ReadAllText(dataPath);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonContent, options) 
                    ?? new Dictionary<string, JsonElement>();

                var interviews = new List<object>();
                if (data.ContainsKey("BuoiPhongVan"))
                {
                    foreach (var item in data["BuoiPhongVan"].EnumerateArray())
                    {
                        interviews.Add(JsonSerializer.Deserialize<object>(item.GetRawText()) ?? new object());
                    }
                }

                return Ok(new { success = true, data = interviews });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading interviews: {ex.Message}");
                return BadRequest(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        [HttpPut("interviews/{id}")]
        public IActionResult UpdateInterview(string id, [FromBody] InterviewRequest request)
        {
            if (string.IsNullOrEmpty(id) || request == null || string.IsNullOrEmpty(request.Title))
                return BadRequest("Dữ liệu không hợp lệ");

            try
            {
                var dataPath = Path.Combine(Directory.GetCurrentDirectory(), "data.json");
                var jsonContent = System.IO.File.ReadAllText(dataPath);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonContent, options) 
                    ?? new Dictionary<string, JsonElement>();

                var newData = new Dictionary<string, object>();
                foreach (var kvp in data)
                {
                    if (kvp.Key == "BuoiPhongVan")
                    {
                        var interviews = new List<object>();
                        bool found = false;
                        foreach (var item in kvp.Value.EnumerateArray())
                        {
                            var interviewObj = JsonSerializer.Deserialize<Dictionary<string, object>>(item.GetRawText(), options) 
                                ?? new Dictionary<string, object>();
                            
                            if (interviewObj != null && interviewObj.ContainsKey("id") && interviewObj["id"]?.ToString() == id)
                            {
                                // Update
                                interviewObj["title"] = request.Title;
                                interviewObj["room"] = request.Room;
                                interviewObj["dateTime"] = request.DateTime;
                                interviewObj["participants"] = request.Participants ?? new string[0];
                                found = true;
                            }
                            interviews.Add(interviewObj);
                        }
                        newData[kvp.Key] = interviews;
                        
                        if (!found)
                            return NotFound(new { success = false, message = "Không tìm thấy buổi phỏng vấn" });
                    }
                    else
                    {
                        newData[kvp.Key] = JsonSerializer.Deserialize<object>(kvp.Value.GetRawText()) ?? new object();
                    }
                }

                SaveData(newData);
                return Ok(new { success = true, message = "Cập nhật buổi phỏng vấn thành công" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating interview: {ex.Message}");
                return BadRequest(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        [HttpDelete("interviews/{id}")]
        public IActionResult DeleteInterview(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest("ID không hợp lệ");

            try
            {
                var dataPath = Path.Combine(Directory.GetCurrentDirectory(), "data.json");
                var jsonContent = System.IO.File.ReadAllText(dataPath);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonContent, options) 
                    ?? new Dictionary<string, JsonElement>();

                var newData = new Dictionary<string, object>();
                bool found = false;
                foreach (var kvp in data)
                {
                    if (kvp.Key == "BuoiPhongVan")
                    {
                        var interviews = new List<object>();
                        foreach (var item in kvp.Value.EnumerateArray())
                        {
                            var interviewObj = JsonSerializer.Deserialize<Dictionary<string, object>>(item.GetRawText(), options) 
                                ?? new Dictionary<string, object>();
                            
                            if (!(interviewObj.ContainsKey("id") && interviewObj["id"]?.ToString() == id))
                            {
                                interviews.Add(interviewObj);
                            }
                            else
                            {
                                found = true;
                            }
                        }
                        newData[kvp.Key] = interviews;
                    }
                    else
                    {
                        newData[kvp.Key] = JsonSerializer.Deserialize<object>(kvp.Value.GetRawText()) ?? new object();
                    }
                }

                if (!found)
                    return NotFound(new { success = false, message = "Không tìm thấy buổi phỏng vấn" });

                SaveData(newData);
                return Ok(new { success = true, message = "Xóa buổi phỏng vấn thành công" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting interview: {ex.Message}");
                return BadRequest(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        [HttpPost("post-facebook")]
        public async Task<IActionResult> PostToFacebook([FromBody] FacebookPostRequest request)
        {
            try
            {
                var pageId = _configuration["Facebook:PageId"];

                if (string.IsNullOrEmpty(pageId))
                    return BadRequest(new { success = false, message = "Facebook PageId chưa được cấu hình" });

                if (string.IsNullOrEmpty(request.Message))
                    return BadRequest(new { success = false, message = "Nội dung bài đăng không được để trống" });

                // Lấy page token
                var pageToken = await GetPageToken();
                if (string.IsNullOrEmpty(pageToken))
                {
                    Console.WriteLine("Failed to get page token");
                    return BadRequest(new { success = false, message = "Không thể lấy page token. Vui lòng kiểm tra access token trong appsettings.json" });
                }

                var url = $"https://graph.facebook.com/v18.0/{pageId}/feed?access_token={pageToken}";

                var content = new StringContent(
                    JsonSerializer.Serialize(new { message = request.Message }),
                    System.Text.Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.PostAsync(url, content);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    return Ok(new
                    {
                        success = true,
                        message = "Đã đăng bài lên Facebook thành công",
                        data = result
                    });
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    
                    // Log chi tiết lỗi
                    Console.WriteLine($"Facebook API Error - Status: {response.StatusCode}");
                    Console.WriteLine($"Facebook API Error - Response: {error}");
                    
                    return BadRequest(new
                    {
                        success = false,
                        message = "Lỗi khi đăng bài lên Facebook (HTTP " + (int)response.StatusCode + ")",
                        statusCode = (int)response.StatusCode,
                        error = error
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                
                return BadRequest(new
                {
                    success = false,
                    message = "Lỗi: " + ex.Message,
                    errorType = ex.GetType().Name
                });
            }
        }

        [HttpGet("employees")]
        public IActionResult GetEmployees()
        {
            try
            {
                var data = LoadData();
                var employees = new List<object>();

                var nhanViensElement = data.RootElement.GetProperty("NhanViens");
                foreach (var item in nhanViensElement.EnumerateArray())
                {
                    employees.Add(new
                    {
                        id = item.GetProperty("MaNV").GetString(),
                        name = item.GetProperty("HoTen").GetString(),
                        role = item.GetProperty("Role").GetString()
                    });
                }

                return Ok(employees);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting employees: {ex.Message}");
                return BadRequest(new List<object>());
            }
        }

        [HttpGet("rooms")]
        public IActionResult GetRooms()
        {
            try
            {
                var data = LoadData();
                var rooms = new List<object>();

                var phongHopElement = data.RootElement.GetProperty("PhongHop");
                foreach (var item in phongHopElement.EnumerateArray())
                {
                    rooms.Add(new
                    {
                        id = item.GetProperty("id").GetInt32(),
                        name = item.GetProperty("name").GetString(),
                        capacity = item.GetProperty("capacity").GetInt32()
                    });
                }

                return Ok(rooms);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting rooms: {ex.Message}");
                return Ok(new[]
                {
                    new { id = 1, name = "Phòng họp 1", capacity = 10 },
                    new { id = 2, name = "Phòng họp 2", capacity = 8 },
                    new { id = 3, name = "Phòng họp 3", capacity = 6 },
                    new { id = 4, name = "Phòng họp online", capacity = 100 }
                });
            }
        }

        [HttpPost("post-facebook-with-media")]
        public async Task<IActionResult> PostToFacebookWithMedia()
        {
            try
            {
                var pageId = _configuration["Facebook:PageId"];
                if (string.IsNullOrEmpty(pageId))
                    return BadRequest(new { success = false, message = "Facebook PageId chưa được cấu hình" });

                var message = Request.Form["message"].ToString();
                if (string.IsNullOrEmpty(message))
                    return BadRequest(new { success = false, message = "Nội dung bài đăng không được để trống" });

                var pageToken = await GetPageToken();
                if (string.IsNullOrEmpty(pageToken))
                    return BadRequest(new { success = false, message = "Không thể lấy page token" });

                string facebookPostId = string.Empty;
                var files = Request.Form.Files;

                // Nếu không có file, dùng JSON POST to /feed
                if (files.Count == 0)
                {
                    Console.WriteLine("Đăng bài text-only...");
                    var url = $"https://graph.facebook.com/v18.0/{pageId}/feed?access_token={pageToken}";
                    var content = new StringContent(
                        JsonSerializer.Serialize(new { message = message }),
                        System.Text.Encoding.UTF8,
                        "application/json"
                    );
                    var response = await _httpClient.PostAsync(url, content);
                    var responseBody = await response.Content.ReadAsStringAsync();

                    Console.WriteLine($"Feed POST Status: {response.StatusCode}");
                    Console.WriteLine($"Feed POST Response: {responseBody}");

                    if (!response.IsSuccessStatusCode)
                    {
                        return BadRequest(new { success = false, message = "Lỗi đăng bài: " + responseBody, error = responseBody });
                    }

                    using (JsonDocument doc = JsonDocument.Parse(responseBody))
                    {
                        if (doc.RootElement.TryGetProperty("id", out JsonElement idElement))
                            facebookPostId = idElement.GetString() ?? "";
                    }
                }
                else
                {
                    // Có file, upload dùng /photos endpoint cho ảnh
                    var file = files[0];
                    var fileExtension = Path.GetExtension(file.FileName).ToLower();
                    bool isVideo = fileExtension == ".mp4" || fileExtension == ".mov" || fileExtension == ".avi";
                    
                    string endpoint = isVideo ? "videos" : "photos";
                    var url = $"https://graph.facebook.com/v18.0/{pageId}/{endpoint}?access_token={pageToken}";

                    Console.WriteLine($"Uploading {endpoint}: {file.FileName}");

                    using (var fileStream = file.OpenReadStream())
                    {
                        var multipartContent = new MultipartFormDataContent();
                        multipartContent.Add(new StreamContent(fileStream), "source", file.FileName);
                        multipartContent.Add(new StringContent(message), "caption");

                        var response = await _httpClient.PostAsync(url, multipartContent);
                        var responseBody = await response.Content.ReadAsStringAsync();

                        Console.WriteLine($"{endpoint.ToUpper()} POST Status: {response.StatusCode}");
                        Console.WriteLine($"{endpoint.ToUpper()} POST Response: {responseBody}");

                        if (!response.IsSuccessStatusCode)
                        {
                            return BadRequest(new { success = false, message = $"Lỗi upload: {responseBody}", error = responseBody });
                        }

                        using (JsonDocument doc = JsonDocument.Parse(responseBody))
                        {
                            if (doc.RootElement.TryGetProperty("id", out JsonElement idElement))
                                facebookPostId = idElement.GetString() ?? "";
                        }
                    }
                }

                return Ok(new
                {
                    success = true,
                    message = "Đã đăng bài lên Facebook thành công",
                    data = new { id = facebookPostId }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}\n{ex.StackTrace}");
                return BadRequest(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        [HttpGet("facebook-posts")]
        public async Task<IActionResult> GetFacebookPosts()
        {
            try
            {
                var pageId = _configuration["Facebook:PageId"];
                var pageToken = await GetPageToken();

                if (string.IsNullOrEmpty(pageToken))
                    return BadRequest(new { success = false, message = "Không thể lấy page token" });

                // Lấy danh sách bài đăng từ Facebook (chỉ dùng fields được hỗ trợ)
                var url = $"https://graph.facebook.com/v18.0/{pageId}/feed?access_token={pageToken}&fields=id,message,created_time";
                var response = await _httpClient.GetAsync(url);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    return Ok(new { success = true, data = result });
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Facebook API Error - Status: {response.StatusCode}");
                    Console.WriteLine($"Facebook API Error - Response: {error}");
                    return BadRequest(new { success = false, message = "Lỗi lấy danh sách bài đăng", error = error });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        [HttpDelete("facebook-post/{postId}")]
        public async Task<IActionResult> DeleteFacebookPost(string postId)
        {
            try
            {
                var pageToken = await GetPageToken();
                if (string.IsNullOrEmpty(pageToken))
                    return BadRequest(new { success = false, message = "Không thể lấy page token" });

                var url = $"https://graph.facebook.com/v18.0/{postId}?access_token={pageToken}";
                var request = new HttpRequestMessage(HttpMethod.Delete, url);
                var response = await _httpClient.SendAsync(request);

                if (response.IsSuccessStatusCode)
                {
                    _posts.Remove(postId);
                    return Ok(new { success = true, message = "Xóa bài đăng thành công" });
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    return BadRequest(new { success = false, message = "Lỗi: " + error });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        [HttpGet("facebook-post/{postId}/comments")]
        public async Task<IActionResult> GetPostComments(string postId)
        {
            try
            {
                var pageToken = await GetPageToken();
                if (string.IsNullOrEmpty(pageToken))
                    return BadRequest(new { success = false, message = "Không thể lấy page token" });

                var url = $"https://graph.facebook.com/v18.0/{postId}/comments?access_token={pageToken}&fields=id,message,created_time,from";
                var response = await _httpClient.GetAsync(url);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    return Ok(new { success = true, data = result });
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    return BadRequest(new { success = false, message = "Lỗi lấy bình luận", error = error });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        [HttpGet("facebook-messages")]
        public async Task<IActionResult> GetFacebookMessages()
        {
            try
            {
                var pageId = _configuration["Facebook:PageId"];
                var pageToken = await GetPageToken();

                if (string.IsNullOrEmpty(pageToken))
                    return BadRequest(new { success = false, message = "Không thể lấy page token" });

                var url = $"https://graph.facebook.com/v18.0/{pageId}/conversations?access_token={pageToken}&fields=id,participants,senders,updated_time";
                var response = await _httpClient.GetAsync(url);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    return Ok(new { success = true, data = result });
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    return BadRequest(new { success = false, message = "Lỗi lấy tin nhắn", error = error });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        [HttpGet("auto-reply-settings")]
        public IActionResult GetAutoReplySettings()
        {
            return Ok(new { success = true, data = new { autoReply = _autoReplyMessage } });
        }

        [HttpPost("auto-reply-settings")]
        public IActionResult SetAutoReplySettings([FromBody] AutoReplyRequest request)
        {
            if (string.IsNullOrEmpty(request.Message))
                return BadRequest(new { success = false, message = "Tin nhắn tự động không được để trống" });

            _autoReplyMessage = request.Message;
            return Ok(new { success = true, message = "Cập nhật tin nhắn tự động thành công", data = new { autoReply = _autoReplyMessage } });
        }
    }

    public class InterviewRequest
    {
        public string? Title { get; set; }
        public string? Room { get; set; }
        public DateTime DateTime { get; set; }
        public string[]? Participants { get; set; }
    }

    public class FacebookPostRequest
    {
        public string? Message { get; set; }
    }

    public class FacebookPostInfo
    {
        public string? Id { get; set; }
        public string? Message { get; set; }
        public string? MediaFileName { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? FacebookId { get; set; }
    }

    public class AutoReplyRequest
    {
        public string? Message { get; set; }
    }
}

