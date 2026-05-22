using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace Api.Features.Notarization;

[Authorize]
public class NotarizationHub : Hub
{
    public async Task JoinSession(string sessionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
        await Clients.OthersInGroup(sessionId).SendAsync("UserJoined", Context.UserIdentifier);
    }

    public async Task LeaveSession(string sessionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);
        await Clients.OthersInGroup(sessionId).SendAsync("UserLeft", Context.UserIdentifier);
    }

    public async Task SendSignal(string sessionId, string signal)
    {
        // For WebRTC signaling (SDP/ICE candidates)
        await Clients.OthersInGroup(sessionId).SendAsync("ReceiveSignal", signal);
    }

    public async Task UpdateDocumentStatus(string sessionId, string documentId, string status)
    {
        await Clients.Group(sessionId).SendAsync("DocumentStatusUpdated", documentId, status);
    }

    public async Task WitnessAdded(string sessionId, object witness)
    {
        await Clients.Group(sessionId).SendAsync("WitnessAdded", witness);
    }
}