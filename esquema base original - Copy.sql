


-- Esquema completo actual para restaurante_db.
-- Uso sugerido en PostgreSQL:
--   CREATE DATABASE restaurante_db;
--   \c restaurante_db
--   Ejecutar este script.









CREATE TABLE salones
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero INT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE areas
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_salon UUID NOT NULL,
    numero INT NOT NULL UNIQUE,
    nombre VARCHAR(50) NULL UNIQUE,
    CONSTRAINT fk_areas_salones
        FOREIGN KEY (id_salon)
        REFERENCES salones(id)
);

CREATE TABLE mesas
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_salon UUID NOT NULL,
    id_area UUID NOT NULL,
    numero VARCHAR(10) NOT NULL UNIQUE,
    capacidad INT NOT NULL DEFAULT 2,
    token_qr VARCHAR(100) NOT NULL UNIQUE,
    estado VARCHAR(20) NOT NULL DEFAULT 'libre'
        CHECK (estado IN ('libre', 'ocupada', 'fuera de servicio', 'reservada')),
    CONSTRAINT fk_mesas_salones
        FOREIGN KEY (id_salon)
        REFERENCES salones(id),
    CONSTRAINT fk_mesas_areas
        FOREIGN KEY (id_area)
        REFERENCES areas(id)
);




CREATE TABLE areas_preparacion
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(80) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE productos_restaurantes
(
    id_producto UUID NOT NULL,
    id_restaurante UUID NOT NULL,
    PRIMARY KEY (id_producto, id_restaurante),
    CONSTRAINT fk_productos_restaurantes_productos
        FOREIGN KEY (id_producto)
        REFERENCES productos(id),
    CONSTRAINT fk_productos_restaurantes_restaurantes
        FOREIGN KEY (id_restaurante)
        REFERENCES restaurantes(id)
);



CREATE TABLE areas_empleados
(
    id_area UUID NOT NULL,
    id_empleado UUID NOT NULL,
    PRIMARY KEY (id_area, id_empleado),
    CONSTRAINT fk_areas_empleados_areas
        FOREIGN KEY (id_area)
        REFERENCES areas(id),
    CONSTRAINT fk_areas_empleados_empleados
        FOREIGN KEY (id_empleado)
        REFERENCES empleados(id)
);

CREATE TABLE comandas
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_empleado UUID NULL,
    id_restaurante UUID NOT NULL,
    id_mesa UUID NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado_operativo VARCHAR(20) NOT NULL DEFAULT 'abierta'
        CHECK (estado_operativo IN ('abierta', 'cerrada')),
    estado_financiero VARCHAR(30) NOT NULL DEFAULT 'pendiente'
        CHECK (estado_financiero IN ('pendiente', 'pagada', 'pagado parcialmente', 'cancelada', 'cortesia')),
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    observaciones TEXT NULL,
    token_qr VARCHAR(100) NOT NULL UNIQUE,
    CONSTRAINT fk_comandas_empleados
        FOREIGN KEY (id_empleado)
        REFERENCES empleados(id),
    CONSTRAINT fk_comandas_restaurantes
        FOREIGN KEY (id_restaurante)
        REFERENCES restaurantes(id),
    CONSTRAINT fk_comandas_mesas
        FOREIGN KEY (id_mesa)
        REFERENCES mesas(id)
);

CREATE TABLE comandas_mesas
(
    id_comanda UUID NOT NULL,
    id_mesa UUID NOT NULL,
    PRIMARY KEY (id_comanda, id_mesa),
    CONSTRAINT fk_comandas_mesas_comandas
        FOREIGN KEY (id_comanda)
        REFERENCES comandas(id),
    CONSTRAINT fk_comandas_mesas_mesas
        FOREIGN KEY (id_mesa)
        REFERENCES mesas(id)
);

CREATE TABLE detalles_comandas
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_comanda UUID NOT NULL,
    id_producto UUID NOT NULL,
    id_empleado UUID NULL,
    cantidad INT NOT NULL,
    precio NUMERIC(10,2) NOT NULL,
    hora TIME NOT NULL,
    estado_financiero VARCHAR(30) NOT NULL DEFAULT 'pendiente'
        CHECK (estado_financiero IN ('pendiente', 'pagada', 'pagado parcialmente', 'cancelada', 'cortesia')),
    estado_operativo VARCHAR(40) NOT NULL DEFAULT 'enviado a cocina',
    impresion BOOLEAN NOT NULL DEFAULT FALSE,
    observaciones TEXT NULL,
    CONSTRAINT fk_detalles_comandas_comandas
        FOREIGN KEY (id_comanda)
        REFERENCES comandas(id),
    CONSTRAINT fk_detalles_comandas_productos
        FOREIGN KEY (id_producto)
        REFERENCES productos(id),
    CONSTRAINT fk_detalles_comandas_empleados
        FOREIGN KEY (id_empleado)
        REFERENCES empleados(id)
);

CREATE TABLE print_jobs
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_comanda UUID NOT NULL,
    id_impresora UUID NOT NULL,
    id_area_preparacion UUID NULL,
    tipo_documento VARCHAR(30) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'procesando', 'completado', 'fallido')),
    intentos INT NOT NULL DEFAULT 0,
    intentos_maximos INT NOT NULL DEFAULT 3,
    ultimo_error TEXT NULL,
    creado_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tomado_en TIMESTAMP WITHOUT TIME ZONE NULL,
    impreso_en TIMESTAMP WITHOUT TIME ZONE NULL,
    fallido_en TIMESTAMP WITHOUT TIME ZONE NULL,
    CONSTRAINT fk_print_jobs_comandas
        FOREIGN KEY (id_comanda)
        REFERENCES comandas(id),
    CONSTRAINT fk_print_jobs_impresoras
        FOREIGN KEY (id_impresora)
        REFERENCES impresoras(id),
    CONSTRAINT fk_print_jobs_areas_preparacion
        FOREIGN KEY (id_area_preparacion)
        REFERENCES areas_preparacion(id)
);

CREATE TABLE print_job_details
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_print_job UUID NOT NULL,
    id_detalle_comanda UUID NOT NULL,
    CONSTRAINT fk_print_job_details_print_jobs
        FOREIGN KEY (id_print_job)
        REFERENCES print_jobs(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_print_job_details_detalles_comandas
        FOREIGN KEY (id_detalle_comanda)
        REFERENCES detalles_comandas(id)
);

CREATE TABLE printer_test_jobs
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_impresora UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'failed')),
    error TEXT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITHOUT TIME ZONE NULL,
    failed_at TIMESTAMP WITHOUT TIME ZONE NULL,
    CONSTRAINT fk_printer_test_jobs_impresoras
        FOREIGN KEY (id_impresora)
        REFERENCES impresoras(id)
);

CREATE TABLE tipos_pago
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(80) NOT NULL UNIQUE,
    requiere_referencia BOOLEAN NOT NULL DEFAULT FALSE,
    afecta_caja BOOLEAN NOT NULL DEFAULT TRUE,
    proveedor VARCHAR(40) NOT NULL DEFAULT 'manual'
        CHECK (proveedor IN ('manual', 'mercado_pago', 'banco', 'terminal')),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE cajas
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_restaurante UUID NOT NULL,
    id_empleado_apertura UUID NULL,
    id_empleado_cierre UUID NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'cerrada'
        CHECK (estado IN ('abierta', 'cerrada')),
    monto_inicial NUMERIC(10,2) NOT NULL DEFAULT 0,
    monto_final NUMERIC(10,2) NULL,
    abierta_en TIMESTAMP WITHOUT TIME ZONE NULL,
    cerrada_en TIMESTAMP WITHOUT TIME ZONE NULL,
    observaciones TEXT NULL,
    CONSTRAINT fk_cajas_restaurantes
        FOREIGN KEY (id_restaurante)
        REFERENCES restaurantes(id),
    CONSTRAINT fk_cajas_empleado_apertura
        FOREIGN KEY (id_empleado_apertura)
        REFERENCES empleados(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_cajas_empleado_cierre
        FOREIGN KEY (id_empleado_cierre)
        REFERENCES empleados(id)
        ON DELETE SET NULL
);

CREATE TABLE movimientos_caja
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_caja UUID NOT NULL,
    id_pago UUID NULL,
    tipo VARCHAR(30) NOT NULL
        CHECK (tipo IN ('ingreso', 'egreso', 'apertura', 'cierre', 'ajuste', 'retiro')),
    concepto VARCHAR(120) NOT NULL,
    monto NUMERIC(10,2) NOT NULL,
    fecha_hora TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    observaciones TEXT NULL,
    CONSTRAINT fk_movimientos_caja_cajas
        FOREIGN KEY (id_caja)
        REFERENCES cajas(id)
);

CREATE TABLE cuentas
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_comanda UUID NOT NULL,
    id_caja UUID NOT NULL,
    tipo_division VARCHAR(30) NOT NULL
        CHECK (tipo_division IN ('completa', 'productos', 'importe', 'partes_iguales')),
    total NUMERIC(10,2) NOT NULL,
    pagado NUMERIC(10,2) NOT NULL DEFAULT 0,
    saldo NUMERIC(10,2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'parcial', 'pagada', 'cancelada')),
    creada_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_cuentas_comandas
        FOREIGN KEY (id_comanda)
        REFERENCES comandas(id),
    CONSTRAINT fk_cuentas_cajas
        FOREIGN KEY (id_caja)
        REFERENCES cajas(id)
);

CREATE TABLE detalle_cuentas
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_cuenta UUID NOT NULL,
    id_detalle_comanda UUID NOT NULL,
    CONSTRAINT fk_detalle_cuentas_cuentas
        FOREIGN KEY (id_cuenta)
        REFERENCES cuentas(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_detalle_cuentas_detalles_comandas
        FOREIGN KEY (id_detalle_comanda)
        REFERENCES detalles_comandas(id),
    CONSTRAINT ux_detalle_cuentas_detalle_comanda
        UNIQUE (id_detalle_comanda)
);

CREATE TABLE pagos
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_cuenta UUID NOT NULL,
    id_tipo_pago UUID NOT NULL,
    monto NUMERIC(10,2) NOT NULL,
    referencia VARCHAR(120) NULL,
    proveedor_pago_id VARCHAR(120) NULL,
    proveedor_estado VARCHAR(60) NULL,
    proveedor_payload_json JSONB NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'aplicado'
        CHECK (estado IN ('pendiente', 'aplicado', 'anulado', 'rechazado')),
    pagado_en TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_pagos_cuentas
        FOREIGN KEY (id_cuenta)
        REFERENCES cuentas(id),
    CONSTRAINT fk_pagos_tipos_pago
        FOREIGN KEY (id_tipo_pago)
        REFERENCES tipos_pago(id)
);

CREATE TABLE detalle_pagos
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pago UUID NOT NULL,
    id_detalle_cuenta UUID NOT NULL,
    cantidad NUMERIC(12,4) NOT NULL
        CHECK (cantidad > 0),
    monto NUMERIC(10,2) NOT NULL
        CHECK (monto > 0),
    CONSTRAINT fk_detalle_pagos_pagos
        FOREIGN KEY (id_pago)
        REFERENCES pagos(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_detalle_pagos_detalle_cuentas
        FOREIGN KEY (id_detalle_cuenta)
        REFERENCES detalle_cuentas(id)
        ON DELETE CASCADE,
    CONSTRAINT ux_detalle_pagos_pago_detalle_cuenta
        UNIQUE (id_pago, id_detalle_cuenta)
);

ALTER TABLE movimientos_caja
    ADD CONSTRAINT fk_movimientos_caja_pagos
        FOREIGN KEY (id_pago)
        REFERENCES pagos(id)
        ON DELETE SET NULL;

ALTER TABLE print_jobs
    ADD COLUMN id_cuenta UUID NULL;

ALTER TABLE print_jobs
    ADD CONSTRAINT fk_print_jobs_cuentas
        FOREIGN KEY (id_cuenta)
        REFERENCES cuentas(id)
        ON DELETE SET NULL;

CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_productos_area_preparacion ON productos(id_area_preparacion);
CREATE INDEX idx_productos_activo ON productos(activo);

CREATE UNIQUE INDEX "RoleNameIndex" ON "AspNetRoles" ("NormalizedName");
CREATE INDEX "EmailIndex" ON "AspNetUsers" ("NormalizedEmail");
CREATE UNIQUE INDEX "UserNameIndex" ON "AspNetUsers" ("NormalizedUserName");
CREATE UNIQUE INDEX ux_aspnetusers_empleado
    ON "AspNetUsers" (id_empleado)
    WHERE id_empleado IS NOT NULL;
CREATE INDEX "IX_AspNetRoleClaims_RoleId" ON "AspNetRoleClaims" ("RoleId");
CREATE INDEX "IX_AspNetUserClaims_UserId" ON "AspNetUserClaims" ("UserId");
CREATE INDEX "IX_AspNetUserLogins_UserId" ON "AspNetUserLogins" ("UserId");
CREATE INDEX "IX_AspNetUserRoles_RoleId" ON "AspNetUserRoles" ("RoleId");

CREATE INDEX idx_mesas_area ON mesas(id_area);
CREATE INDEX idx_mesas_salon ON mesas(id_salon);
CREATE INDEX idx_mesas_estado ON mesas(estado);

CREATE INDEX idx_comandas_mesa_estado_operativo ON comandas(id_mesa, estado_operativo);
CREATE INDEX idx_comandas_restaurante ON comandas(id_restaurante);
CREATE INDEX idx_detalles_comandas_comanda ON detalles_comandas(id_comanda);
CREATE INDEX idx_detalles_comandas_producto ON detalles_comandas(id_producto);

CREATE INDEX idx_print_jobs_estado_creado ON print_jobs(estado, creado_en);
CREATE INDEX idx_print_jobs_impresora ON print_jobs(id_impresora);
CREATE INDEX idx_print_jobs_area_preparacion ON print_jobs(id_area_preparacion);
CREATE INDEX idx_print_job_details_print_job ON print_job_details(id_print_job);
CREATE INDEX idx_print_job_details_detalle_comanda ON print_job_details(id_detalle_comanda);

CREATE INDEX idx_printer_test_jobs_status_created ON printer_test_jobs(status, created_at);
CREATE INDEX idx_printer_test_jobs_impresora ON printer_test_jobs(id_impresora);

CREATE INDEX idx_tipos_pago_activo ON tipos_pago(activo);
CREATE INDEX idx_cajas_restaurante ON cajas(id_restaurante);
CREATE INDEX idx_cajas_estado ON cajas(estado);
CREATE INDEX idx_movimientos_caja_caja ON movimientos_caja(id_caja);
CREATE INDEX idx_movimientos_caja_pago ON movimientos_caja(id_pago);
CREATE INDEX idx_movimientos_caja_fecha ON movimientos_caja(fecha_hora);
CREATE INDEX idx_cuentas_comanda ON cuentas(id_comanda);
CREATE INDEX idx_cuentas_caja ON cuentas(id_caja);
CREATE INDEX idx_cuentas_estado ON cuentas(estado);
CREATE INDEX idx_detalle_cuentas_cuenta ON detalle_cuentas(id_cuenta);
CREATE INDEX idx_pagos_cuenta ON pagos(id_cuenta);
CREATE INDEX idx_pagos_tipo_pago ON pagos(id_tipo_pago);
CREATE INDEX idx_pagos_estado ON pagos(estado);
CREATE INDEX idx_detalle_pagos_pago ON detalle_pagos(id_pago);
CREATE INDEX idx_detalle_pagos_detalle_cuenta ON detalle_pagos(id_detalle_cuenta);
CREATE INDEX idx_print_jobs_cuenta ON print_jobs(id_cuenta);

INSERT INTO tipos_pago (nombre, requiere_referencia, afecta_caja, proveedor, activo)
VALUES
    ('Efectivo', FALSE, TRUE, 'manual', TRUE),
    ('Tarjeta', TRUE, FALSE, 'terminal', TRUE),
    ('Transferencia', TRUE, FALSE, 'banco', TRUE),
    ('Mercado Pago', TRUE, FALSE, 'mercado_pago', TRUE)
ON CONFLICT (nombre) DO NOTHING;
