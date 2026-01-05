# Guía para Crear Noticias - AVC Fitness App

## Descripción

Las noticias se muestran en la pantalla principal (Home) de la app en un carrusel horizontal. Los usuarios pueden tocar una noticia para ver el detalle completo en un modal.

---

## Estructura de la Colección `news`

Cada documento en la colección `news` de Firestore debe tener los siguientes campos:

| Campo              | Tipo      | Requerido | Descripción                                                 |
| ------------------ | --------- | --------- | ----------------------------------------------------------- |
| `titulo`           | string    | ✅        | Título de la noticia (máx. 60 caracteres recomendado)       |
| `resumen`          | string    | ✅        | Resumen corto para el carrusel (máx. 100 caracteres)        |
| `contenido`        | string    | ✅        | Texto completo de la noticia. Usa `\n` para saltos de línea |
| `imagenUrl`        | string    | ✅        | URL de la imagen (recomendado: 800x400px)                   |
| `categoria`        | string    | ✅        | Una de: `Horarios`, `Promociones`, `Eventos`, `General`     |
| `fechaPublicacion` | timestamp | ✅        | Fecha de publicación                                        |
| `fechaVencimiento` | timestamp | ✅        | Fecha hasta cuando se muestra la noticia                    |
| `activo`           | boolean   | ✅        | `true` para mostrar, `false` para ocultar                   |
| `destacado`        | boolean   | ✅        | `true` para mostrar primero con badge especial              |
| `createdAt`        | timestamp | ✅        | Fecha de creación del documento                             |

---

## Crear Noticia desde Firebase Console

### 1. Ir a Firestore Database

1. Abre [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Firestore Database**

### 2. Crear/Seleccionar la Colección

1. Si no existe la colección `news`, haz clic en **"Start collection"**
2. Escribe `news` como Collection ID
3. Haz clic en **Next**

### 3. Agregar un Documento

1. **Document ID**: Deja en "Auto-ID" (se genera automáticamente)
2. Agrega los campos uno por uno:

#### Campos de texto (tipo `string`):

```
titulo: "🎉 Promoción de Año Nuevo"
resumen: "Inscríbete en enero y obtén 2 meses gratis + kit de bienvenida"
contenido: "¡Arranca el 2026 con todo!\n\nInscríbete en enero y obtén:\n\n• 2 meses gratis de membresía\n• 1 sesión de nutrición personalizada\n• Kit de bienvenida AVC\n\n¡Te esperamos!"
imagenUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
categoria: "Promociones"
```

#### Campos de fecha (tipo `timestamp`):

- **fechaPublicacion**: Selecciona el tipo `timestamp` y elige la fecha/hora
- **fechaVencimiento**: Selecciona el tipo `timestamp` y elige cuando expira
- **createdAt**: Selecciona el tipo `timestamp` con la fecha actual

#### Campos booleanos (tipo `boolean`):

- **activo**: `true` (para que se muestre)
- **destacado**: `true` o `false` (las destacadas aparecen primero)

### 4. Guardar

Haz clic en **Save** para crear el documento.

---

## Categorías Disponibles

| Categoría     | Color Badge        | Uso                                        |
| ------------- | ------------------ | ------------------------------------------ |
| `Horarios`    | Azul (#dbeafe)     | Cambios de horario, nuevas clases          |
| `Promociones` | Verde (#dcfce7)    | Ofertas, descuentos, paquetes              |
| `Eventos`     | Amarillo (#fef3c7) | Competencias, talleres, eventos especiales |
| `General`     | Gris (#f3f4f6)     | Avisos generales, mantenimiento            |

---

## Ejemplos de Noticias

### Promoción (Destacada)

```json
{
  "titulo": "🎉 Promoción de Año Nuevo",
  "resumen": "Inscríbete en enero y obtén 2 meses gratis",
  "contenido": "¡Arranca el 2026 con todo!\n\nInscríbete en enero y obtén:\n\n• 2 meses gratis de membresía\n• 1 sesión de nutrición personalizada\n• Kit de bienvenida AVC\n\n¡Te esperamos!",
  "imagenUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
  "categoria": "Promociones",
  "fechaPublicacion": [timestamp: 2026-01-01],
  "fechaVencimiento": [timestamp: 2026-01-31],
  "activo": true,
  "destacado": true,
  "createdAt": [timestamp: ahora]
}
```

### Cambio de Horarios

```json
{
  "titulo": "Nuevos Horarios de CrossFit",
  "resumen": "Nuevos horarios desde el 6 de enero. ¡Más opciones!",
  "contenido": "A partir del 6 de enero tenemos nuevos horarios:\n\n🌅 Mañana:\n• 6:00 AM - CrossFit\n• 7:00 AM - CrossFit\n• 8:00 AM - Funcional\n\n🌙 Tarde:\n• 5:00 PM - CrossFit\n• 6:00 PM - CrossFit\n• 7:00 PM - CrossFit\n\n¡Reserva tu lugar!",
  "imagenUrl": "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800",
  "categoria": "Horarios",
  "fechaPublicacion": [timestamp: 2026-01-04],
  "fechaVencimiento": [timestamp: 2026-02-28],
  "activo": true,
  "destacado": false,
  "createdAt": [timestamp: ahora]
}
```

### Evento

```json
{
  "titulo": "Competencia Interna - Sábado 18 Enero",
  "resumen": "Primera competencia del año. ¡Inscríbete ya!",
  "contenido": "¡Prepárate para la primera competencia del año!\n\n📅 Fecha: Sábado 18 de Enero\n⏰ Hora: 9:00 AM\n\n🏆 Categorías:\n• RX (Prescrito)\n• Scaled (Adaptado)\n• Masters (+40 años)\n\n💰 Costo: $200 MXN\n\n¡Inscríbete en recepción!",
  "imagenUrl": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800",
  "categoria": "Eventos",
  "fechaPublicacion": [timestamp: 2026-01-04],
  "fechaVencimiento": [timestamp: 2026-01-18],
  "activo": true,
  "destacado": true,
  "createdAt": [timestamp: ahora]
}
```

---

## Imágenes Recomendadas

### Fuentes Gratuitas

- [Unsplash](https://unsplash.com) - Buscar "crossfit", "gym", "fitness"
- [Pexels](https://pexels.com)

### Formato Recomendado

- **Tamaño**: 800x400 píxeles (proporción 2:1)
- **Formato**: JPG o PNG
- **Peso**: Menos de 500KB

### URLs de Ejemplo (Unsplash)

```
# Gimnasio general
https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800

# CrossFit
https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800

# Competencia
https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800

# Pesas
https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800
```

---

## Notas Importantes

1. **Fechas como Timestamp**: En Firebase Console, asegúrate de seleccionar el tipo `timestamp`, NO `string`

2. **Fecha de Vencimiento**: Las noticias con `fechaVencimiento` pasada no se mostrarán automáticamente

3. **Orden de Aparición**:

   - Primero las **destacadas** (`destacado: true`)
   - Luego ordenadas por `fechaPublicacion` (más recientes primero)

4. **Ocultar sin Eliminar**: Para ocultar temporalmente una noticia, cambia `activo` a `false`

5. **Emojis**: Puedes usar emojis en el título y contenido para hacerlo más visual 🎉💪🔥

---

## Solución de Problemas

### La noticia no aparece

1. Verifica que `activo` sea `true`
2. Verifica que `fechaVencimiento` sea una fecha futura
3. Revisa los logs de la app buscando `📰`

### La imagen no carga

1. Verifica que la URL sea accesible desde un navegador
2. Usa URLs con HTTPS
3. Asegúrate de que la imagen no sea muy grande (< 1MB)

### El texto se corta

- **Título**: Máximo 60 caracteres recomendado
- **Resumen**: Máximo 100 caracteres
- **Contenido**: Sin límite, puede usar saltos de línea con `\n`
