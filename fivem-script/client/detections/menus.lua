-- Détection de menus de triche
CreateThread(function()
    local suspiciousTextures = {
        "lynx", "modest", "dopamine", "euler", "eulen",
        "redengine", "brutan", "meow", "alokas", "crystal",
        "hoax", "lumia", "stand", "phantom", "impulse",
        "cherax", "paragon", "midnight", "terror", "ozark"
    }
    
    while true do
        Wait(5000)
        
        if not Config.Detections.MenuDetection then
            goto continue
        end
        
        -- Vérifier textures suspectes
        for _, textureName in ipairs(suspiciousTextures) do
            if HasStreamedTextureDictLoaded(textureName) then
                NXT.SendDetection("Menu Detection", {
                    type = "Suspicious Texture",
                    texture = textureName
                })
            end
        end
        
        -- Vérifier ressources injectées
        if Config.Detections.ResourceInjection then
            local numResources = GetNumResources()
            
            for i = 0, numResources - 1 do
                local resourceName = GetResourceByFindIndex(i)
                
                if resourceName and string.find(string.lower(resourceName), "cheat") or 
                   string.find(string.lower(resourceName), "hack") or
                   string.find(string.lower(resourceName), "mod") then
                    NXT.SendDetection("Resource Injection", {
                        resourceName = resourceName
                    })
                end
            end
        end
        
        ::continue::
    end
end)

-- Désactiver certains contrôles de debug
CreateThread(function()
    while true do
        Wait(0)
        
        -- Désactiver F8 (console)
        DisableControlAction(0, 322, true)
        
        -- Désactiver certaines touches de debug si nécessaire
        -- DisableControlAction(0, 323, true) -- X
    end
end)
