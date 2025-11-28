Config = {}

-- CONFIGURATION OBLIGATOIRE
Config.LicenseKey = "VOTRE_CLE_DE_LICENCE" -- À obtenir depuis votre panel
Config.APIEndpoint = "http://votre-domaine.com:5000" -- URL de votre API

-- Paramètres généraux
Config.ServerName = "Mon Serveur FiveM"
Config.MaxPlayers = 32

-- Heartbeat (en secondes)
Config.HeartbeatInterval = 30

-- Actions automatiques
Config.AutoBan = true
Config.AutoKick = true
Config.TakeScreenshot = false -- Nécessite screenshot-basic

-- Webhooks Discord
Config.Webhook = {
    Enabled = true,
    URL = "https://discord.com/api/webhooks/...", -- Optionnel
    Color = 15158332, -- Rouge
    Title = "🚨 NXT Anti-Cheat",
    Footer = "NXT Anti-Cheat • Protection Professionnelle"
}

-- Détections (activées par défaut, contrôlables depuis le panel)
Config.Detections = {
    Aimbot = true,
    SpeedHack = true,
    Noclip = true,
    GodMode = true,
    WeaponModifier = true,
    VehicleModifier = true,
    Teleport = true,
    ResourceInjection = true,
    MenuDetection = true,
    ExplosionSpam = true,
    ParticleSpam = true
}

-- Listes noires
Config.BlacklistedWeapons = {
    `WEAPON_RAILGUN`,
    `WEAPON_STUNGUN`,
    -- Ajoutez d'autres armes
}

Config.BlacklistedVehicles = {
    -- `khanjali`, -- Tank
}

Config.BlacklistedExplosions = {
    2,  -- GRENADE_LAUNCHER
    4,  -- ROCKET
    5,  -- TANK_SHELL
    25, -- EXPLOSIVE_AMMO
    32, -- PLANE_ROCKET
    33, -- VEHICLE_BULLET
}

-- Limites de détection
Config.Limits = {
    MaxSpeed = 150.0, -- m/s (environ 540 km/h)
    MaxTeleportDistance = 500.0, -- mètres
    MaxHealthRegen = 20, -- HP par seconde
    MaxExplosions = 3, -- Par période
    ExplosionPeriod = 10000, -- ms
}

-- Messages
Config.Messages = {
    Banned = "🚫 Vous avez été banni par NXT Anti-Cheat\nRaison: %s",
    Kicked = "⚠️ Vous avez été expulsé\nRaison: %s",
    LicenseInvalid = "❌ Licence NXT Anti-Cheat invalide ou expirée",
    Protected = "✅ Serveur protégé par NXT Anti-Cheat"
}
