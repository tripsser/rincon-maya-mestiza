CREATE TABLE activos_tecnologicos
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(40) NOT NULL,
    id_unidad_operativa UUID NOT NULL,
    tipo VARCHAR(40) NOT NULL
        CHECK (tipo IN ('computadora', 'impresora', 'lector_nfc', 'lector_huella', 'lector_barras', 'caja_registradora', 'cajon_dinero', 'terminal_pago', 'bascula', 'pantalla', 'tablet')),
    nombre VARCHAR(120) NOT NULL,
    marca VARCHAR(80) NULL,
    modelo VARCHAR(100) NULL,
    numero_serie VARCHAR(120) NULL,
    direccion_mac VARCHAR(30) NULL,
    direccion_ip VARCHAR(80) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    notas TEXT NULL,
    creado_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activos_tecnologicos_unidades_operativas
        FOREIGN KEY (id_unidad_operativa)
        REFERENCES unidades_operativas(id),
    CONSTRAINT ux_activos_tecnologicos_unidad_codigo
        UNIQUE (id_unidad_operativa, codigo)
);

CREATE TABLE computadoras
(
    id_activo_tecnologico UUID PRIMARY KEY,
    nombre_host VARCHAR(120) NULL,
    sistema_operativo VARCHAR(80) NULL,
    version_sistema VARCHAR(80) NULL,
    usuario_sistema VARCHAR(120) NULL,
    CONSTRAINT fk_computadoras_activos_tecnologicos
        FOREIGN KEY (id_activo_tecnologico)
        REFERENCES activos_tecnologicos(id)
        ON DELETE CASCADE
);

CREATE TABLE impresoras
(
    id_activo_tecnologico UUID PRIMARY KEY,
    tipo_impresora VARCHAR(30) NOT NULL
        CHECK (tipo_impresora IN ('termica', 'documentos', 'etiquetas')),
    tipo_conexion VARCHAR(30) NOT NULL
        CHECK (tipo_conexion IN ('spooler_windows', 'tcp_raw', 'usb')),
    nombre_spooler VARCHAR(160) NULL,
    puerto INT NULL,
    ancho_papel_mm INT NULL,
    caracteres_por_linea INT NULL,
    soporta_corte BOOLEAN NOT NULL DEFAULT FALSE,
    soporta_cajon_dinero BOOLEAN NOT NULL DEFAULT FALSE,
    comunicacion_bidireccional BOOLEAN NOT NULL DEFAULT FALSE,
    estado VARCHAR(20) NOT NULL DEFAULT 'habilitada'
        CHECK (estado IN ('habilitada', 'inhabilitada')),
    estado_conexion VARCHAR(20) NOT NULL DEFAULT 'sin_verificar'
        CHECK (estado_conexion IN ('sin_verificar', 'conectada', 'sin_conexion')),
    estado_impresora VARCHAR(30) NULL
        CHECK (estado_impresora IS NULL OR estado_impresora IN ('lista', 'ocupada', 'sin_papel', 'tapa_abierta', 'atascada', 'error')),
    detalle_error TEXT NULL,
    ultima_comunicacion_en TIMESTAMP WITHOUT TIME ZONE NULL,
    CONSTRAINT fk_impresoras_activos_tecnologicos
        FOREIGN KEY (id_activo_tecnologico)
        REFERENCES activos_tecnologicos(id)
        ON DELETE CASCADE
);

-- CREATE TABLE lectores_nfc
-- (
--     id_activo_tecnologico UUID PRIMARY KEY,
--     tipo_conexion VARCHAR(30) NOT NULL DEFAULT 'usb'
--         CHECK (tipo_conexion IN ('usb')),
--     vendor_id VARCHAR(40) NULL,
--     product_id VARCHAR(40) NULL,
--     CONSTRAINT fk_lectores_nfc_activos_tecnologicos
--         FOREIGN KEY (id_activo_tecnologico)
--         REFERENCES activos_tecnologicos(id)
--         ON DELETE CASCADE
-- );

-- CREATE TABLE lectores_huella
-- (
--     id_activo_tecnologico UUID PRIMARY KEY,
--     tipo_conexion VARCHAR(30) NOT NULL
--         CHECK (tipo_conexion IN ('usb', 'tcp')),
--     proveedor_sdk VARCHAR(120) NULL,
--     CONSTRAINT fk_lectores_huella_activos_tecnologicos
--         FOREIGN KEY (id_activo_tecnologico)
--         REFERENCES activos_tecnologicos(id)
--         ON DELETE CASCADE
-- );

-- CREATE TABLE lectores_barras
-- (
--     id_activo_tecnologico UUID PRIMARY KEY,
--     tipo_conexion VARCHAR(30) NOT NULL
--         CHECK (tipo_conexion IN ('usb_hid', 'serial', 'bluetooth', 'tcp')),
--     modo_lectura VARCHAR(30) NOT NULL DEFAULT 'teclado'
--         CHECK (modo_lectura IN ('teclado', 'serial')),
--     CONSTRAINT fk_lectores_barras_activos_tecnologicos
--         FOREIGN KEY (id_activo_tecnologico)
--         REFERENCES activos_tecnologicos(id)
--         ON DELETE CASCADE
-- );

-- CREATE TABLE cajas_registradoras
-- (
--     id_activo_tecnologico UUID PRIMARY KEY,
--     tipo_conexion VARCHAR(30) NOT NULL
--         CHECK (tipo_conexion IN ('impresora', 'usb', 'serial', 'tcp')),
--     comando_apertura VARCHAR(120) NULL,
--     CONSTRAINT fk_cajas_registradoras_activos_tecnologicos
--         FOREIGN KEY (id_activo_tecnologico)
--         REFERENCES activos_tecnologicos(id)
--         ON DELETE CASCADE
-- );

CREATE TABLE agentes_locales
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(40) NOT NULL,
    id_computadora UUID NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    tipo VARCHAR(30) NOT NULL DEFAULT 'general'
        CHECK (tipo IN ('general', 'impresion', 'perifericos')),
    token_hash TEXT NOT NULL,
    version VARCHAR(40) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    ultima_conexion_en TIMESTAMP WITHOUT TIME ZONE NULL,
    creado_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_agentes_locales_computadoras
        FOREIGN KEY (id_computadora)
        REFERENCES computadoras(id_activo_tecnologico),
    CONSTRAINT ux_agentes_locales_computadora
        UNIQUE (id_computadora),
    CONSTRAINT ux_agentes_locales_codigo
        UNIQUE (codigo)
);

CREATE TABLE trabajos_impresion
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(40) NOT NULL,
    id_impresora UUID NOT NULL,
    id_agente_local UUID NULL,
    tipo_documento VARCHAR(40) NOT NULL
        CHECK (tipo_documento IN ('comanda', 'cuenta', 'corte_caja', 'prueba', 'reimpresion', 'reporte')),
    origen_tipo VARCHAR(40) NULL,
    origen_id UUID NULL,
    estado VARCHAR(40) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'tomado_por_agente', 'renderizando', 'enviado_a_spooler', 'enviado_por_tcp', 'esperando_confirmacion', 'completado', 'fallido', 'cancelado')),
    estado_error VARCHAR(40) NULL
        CHECK (estado_error IS NULL OR estado_error IN ('sin_agente', 'impresora_no_asignada', 'impresora_no_disponible', 'render_fallido', 'spooler_no_encontrado', 'spooler_rechazado', 'tcp_sin_conexion', 'tcp_timeout', 'confirmacion_timeout', 'cancelado_por_usuario', 'desconocido')),
    prioridad INT NOT NULL DEFAULT 0,
    intentos INT NOT NULL DEFAULT 0,
    intentos_maximos INT NOT NULL DEFAULT 3,
    payload_json JSONB NOT NULL,
    error TEXT NULL,
    creado_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tomado_en TIMESTAMP WITHOUT TIME ZONE NULL,
    impreso_en TIMESTAMP WITHOUT TIME ZONE NULL,
    fallido_en TIMESTAMP WITHOUT TIME ZONE NULL,
    cancelado_en TIMESTAMP WITHOUT TIME ZONE NULL,
    CONSTRAINT fk_trabajos_impresion_impresoras
        FOREIGN KEY (id_impresora)
        REFERENCES impresoras(id_activo_tecnologico),
    CONSTRAINT fk_trabajos_impresion_agentes_locales
        FOREIGN KEY (id_agente_local)
        REFERENCES agentes_locales(id)
        ON DELETE SET NULL,
    CONSTRAINT ux_trabajos_impresion_codigo
        UNIQUE (codigo)
);

CREATE TABLE eventos_trabajos_impresion
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_trabajo_impresion UUID NOT NULL,
    estado VARCHAR(40) NOT NULL,
    estado_error VARCHAR(40) NULL,
    mensaje TEXT NULL,
    creado_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eventos_trabajos_impresion_trabajos
        FOREIGN KEY (id_trabajo_impresion)
        REFERENCES trabajos_impresion(id)
        ON DELETE CASCADE
);




CREATE INDEX idx_activos_tecnologicos_unidad ON activos_tecnologicos(id_unidad_operativa);
CREATE INDEX idx_activos_tecnologicos_tipo ON activos_tecnologicos(tipo);
CREATE INDEX idx_activos_tecnologicos_activo ON activos_tecnologicos(activo);
CREATE INDEX idx_impresoras_estado ON impresoras(estado);
CREATE INDEX idx_agentes_locales_computadora ON agentes_locales(id_computadora);
CREATE INDEX idx_agentes_locales_activo ON agentes_locales(activo);
CREATE INDEX idx_trabajos_impresion_estado_prioridad ON trabajos_impresion(estado, prioridad, creado_en);
CREATE INDEX idx_trabajos_impresion_impresora_estado ON trabajos_impresion(id_impresora, estado);
CREATE INDEX idx_trabajos_impresion_agente_estado ON trabajos_impresion(id_agente_local, estado);
CREATE INDEX idx_trabajos_impresion_origen ON trabajos_impresion(origen_tipo, origen_id);
CREATE INDEX idx_eventos_trabajos_impresion_trabajo ON eventos_trabajos_impresion(id_trabajo_impresion);