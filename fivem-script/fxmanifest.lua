fx_version 'cerulean'
game 'gta5'

author 'NXT Anti-Cheat'
description 'Système anti-cheat professionnel pour FiveM'
version '1.0.0'

server_scripts {
    'config.lua',
    'server/utils.lua',
    'server/api.lua',
    'server/detections.lua',
    'server/main.lua'
}

client_scripts {
    'config.lua',
    'client/utils.lua',
    'client/detections/*.lua',
    'client/main.lua'
}

files {
    'html/index.html',
    'html/style.css',
    'html/script.js'
}

ui_page 'html/index.html'
