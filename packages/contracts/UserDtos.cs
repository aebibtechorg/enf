namespace Contracts;

public record UserDto(
    Guid Id, 
    string Email, 
    string FullName, 
    DateTime CreatedAt,
    bool IsEnp,
    string? CommissionNumber,
    DateTime? CommissionExpiry,
    string? RollNumber,
    string? IbpNumber,
    string? RegularPlaceOfBusiness,
    string EkycStatus,
    bool IsOnboarded,
    bool WatchedInstructionalVideo);

public record CreateUserRequest(string Email, string FullName);

public record ApplyEnpRequest(
    string CommissionNumber,
    DateTime CommissionExpiry,
    string RollNumber,
    string IbpNumber,
    string RegularPlaceOfBusiness,
    bool WatchedInstructionalVideo);
