namespace Contracts;

public record UserDto(Guid Id, string Email, string FullName, DateTime CreatedAt);
public record CreateUserRequest(string Email, string FullName);
