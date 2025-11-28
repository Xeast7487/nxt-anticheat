-- Utilitaires client
NXT = {}
NXT.Protected = false
NXT.Features = {}

function NXT.Notify(message, type)
    type = type or "info"
    -- Envoyer notification
    SetNotificationTextEntry("STRING")
    AddTextComponentString(message)
    DrawNotification(false, false)
end

function NXT.SendDetection(detectionType, details)
    TriggerServerEvent('nxt:detection', detectionType, details)
end

-- Obtenir la distance entre deux coords
function NXT.GetDistance(coords1, coords2)
    return #(vector3(coords1.x, coords1.y, coords1.z) - vector3(coords2.x, coords2.y, coords2.z))
end
