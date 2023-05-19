import os
import json
import re
from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin
import sys

uid = sys.argv[1] + '.json'


def limpiar_texto(texto):
    """Limpia el texto eliminando los símbolos no deseados"""
    texto_limpio = re.sub(r'[^\w\s]', '', texto)
    return texto_limpio.strip()

def obtener_capitulos(url):
    try:
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            chapters = soup.find_all('li', class_='row')[:4]
            capitulos = []
            for chapter in chapters:
                nombre_cap = limpiar_texto(chapter.find('h4').text)
                link = urljoin(url, chapter.find('a')['href'])
                capitulos.append({'capitulo': nombre_cap, 'url': link, 'leido': False})
            return capitulos
        else:
            print(f'Error al realizar la solicitud HTTP a la URL: {url}')
            return []
    except requests.exceptions.RequestException as e:
        print(f'Error al realizar la solicitud HTTP a la URL: {url}')
        print(f'Error: {e}')
        return []

def obtener_animes(urls):
    animes = {}
    capitulos = []

    for url in urls:
        try:
            chapters = obtener_capitulos(url)
            if chapters:
                response = requests.get(url)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    titulo = soup.find_all('h1')
                    imagen = soup.find_all('div', class_='media-left cover-detail')

                    base_url = response.url
                    nombre = limpiar_texto(titulo[0].text)
                    imagen_url = urljoin(base_url, imagen[0].find('img')['src'])

                    if nombre in animes:
                        # Actualizar los capítulos existentes
                        anime = animes[nombre]
                        for chapter in chapters:
                            if chapter not in anime['link']:
                                anime['link'].insert(0, chapter)
                    else:
                        animes[nombre] = {
                            'nombre': nombre,
                            'imagen_url': imagen_url,
                            'link': chapters
                        }

                    capitulos.extend([{
                        'id': len(capitulos) + 2,
                        'imagen_url': imagen_url,
                        'nombre': nombre,
                        'link': chapters
                    }])
        except requests.exceptions.RequestException as e:
            print(f'Error al realizar la solicitud HTTP a la URL: {url}')
            print(f'Error: {e}')

    return animes, capitulos



def cargar_resultados():
    if not os.path.exists(uid) or os.stat(uid).st_size == 0:
        return [], 0
    else:
        with open(uid, 'r') as archivo:
            capitulos = json.load(archivo)
        ultimo_id = max([c['id'] for c in capitulos]) if capitulos else 0
        return capitulos, ultimo_id

def actualizar_resultados(capitulos):
    with open(uid, 'w') as archivo:
        json.dump(capitulos, archivo, indent=4)
    print('Resultados guardados en resultados.json')

def main():
    urls = [
       'https://www.leercapitulo.com/manga/c4kt5e/tengoku-daimakyo/',
    ]

    animes, capitulos = obtener_animes(urls)
    resultados_capitulos, ultimo_id = cargar_resultados()

    # Actualizar los capítulos existentes con los nuevos enlaces
    for anime in resultados_capitulos:
        nombre = anime['nombre']
        if nombre in animes:
            anime['link'].extend([c for c in animes[nombre]['link'] if c not in anime['link']])

    # Agregar los nuevos capítulos a los resultados existentes
    nuevos_capitulos = [c for c in capitulos if c['id'] > ultimo_id]
    resultados_capitulos.extend(nuevos_capitulos)

    actualizar_resultados(resultados_capitulos)

if __name__ == "__main__":
    main()

