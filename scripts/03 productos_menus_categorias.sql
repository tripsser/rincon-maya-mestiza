-- Entidades base para menus, categorias, productos y areas de preparacion.
-- Requiere que existan unidades_operativas e impresoras.

CREATE TABLE menus
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(40) NOT NULL,
    id_unidad_operativa UUID NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_menus_unidades_operativas
        FOREIGN KEY (id_unidad_operativa)
        REFERENCES unidades_operativas(id),
    CONSTRAINT ux_menus_unidad_codigo
        UNIQUE (id_unidad_operativa, codigo)
);

CREATE TABLE categorias
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(40) NOT NULL,
    id_menu UUID NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    orden INT NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categorias_menus
        FOREIGN KEY (id_menu)
        REFERENCES menus(id),
    CONSTRAINT ux_categorias_menu_codigo
        UNIQUE (id_menu, codigo)
);

CREATE TABLE areas_preparacion
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(40) NOT NULL,
    id_unidad_operativa UUID NOT NULL,
    id_impresora UUID NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_areas_preparacion_unidades_operativas
        FOREIGN KEY (id_unidad_operativa)
        REFERENCES unidades_operativas(id),
    CONSTRAINT fk_areas_preparacion_impresoras
        FOREIGN KEY (id_impresora)
        REFERENCES impresoras(id_activo_tecnologico),
    CONSTRAINT ux_areas_preparacion_unidad_codigo
        UNIQUE (id_unidad_operativa, codigo),
    CONSTRAINT ux_areas_preparacion_impresora
        UNIQUE (id_impresora)
);

CREATE TABLE productos
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(40) NOT NULL,
    id_categoria UUID NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT NULL,
    imagen_url TEXT NULL,
    precio NUMERIC(10,2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_productos_categorias
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id),
    CONSTRAINT ux_productos_categoria_codigo
        UNIQUE (id_categoria, codigo)
);

CREATE TABLE productos_areas_preparacion
(
    id_producto UUID NOT NULL,
    id_area_preparacion UUID NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_productos_areas_preparacion
        PRIMARY KEY (id_producto, id_area_preparacion),
    CONSTRAINT fk_productos_areas_preparacion_productos
        FOREIGN KEY (id_producto)
        REFERENCES productos(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_productos_areas_preparacion_areas
        FOREIGN KEY (id_area_preparacion)
        REFERENCES areas_preparacion(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_menus_unidad ON menus(id_unidad_operativa);
CREATE INDEX idx_menus_activo ON menus(activo);
CREATE INDEX idx_categorias_menu ON categorias(id_menu);
CREATE INDEX idx_categorias_activo ON categorias(activo);
CREATE INDEX idx_areas_preparacion_unidad ON areas_preparacion(id_unidad_operativa);
CREATE INDEX idx_areas_preparacion_impresora ON areas_preparacion(id_impresora);
CREATE INDEX idx_areas_preparacion_activo ON areas_preparacion(activo);
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_productos_areas_preparacion_area ON productos_areas_preparacion(id_area_preparacion);
CREATE INDEX idx_productos_areas_preparacion_activo ON productos_areas_preparacion(activo);
