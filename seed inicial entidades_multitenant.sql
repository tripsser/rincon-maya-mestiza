-- Seed inicial para entidades_multitenant.
-- Objetivo: crear un usuario administrador con inquilino, restaurante,
-- unidad operativa, roles, permisos y asignaciones para probar login,
-- Redis session, TenantScopes y OperationalScopes.
--
-- Usuario:
--   Email: admin@rinconmaya.test
--   Password: Admin123!

BEGIN;

DO $$
DECLARE
    v_usuario_id UUID := '10000000-0000-0000-0000-000000000001';
    v_inquilino_id UUID := '20000000-0000-0000-0000-000000000001';
    v_rol_inquilino_id UUID := '21000000-0000-0000-0000-000000000001';
    v_asignacion_inquilino_id UUID := '22000000-0000-0000-0000-000000000001';

    v_perm_inq_configurar UUID := '23000000-0000-0000-0000-000000000001';
    v_perm_inq_rest_crear UUID := '23000000-0000-0000-0000-000000000002';
    v_perm_inq_rest_editar UUID := '23000000-0000-0000-0000-000000000003';
    v_perm_inq_unidad_crear UUID := '23000000-0000-0000-0000-000000000004';
    v_perm_inq_usuarios_invitar UUID := '23000000-0000-0000-0000-000000000005';

    v_restaurante_id UUID := '30000000-0000-0000-0000-000000000001';
    v_entidad_fiscal_id UUID := '31000000-0000-0000-0000-000000000001';
    v_direccion_id UUID := '32000000-0000-0000-0000-000000000001';
    v_unidad_operativa_id UUID := '33000000-0000-0000-0000-000000000001';

    v_empleado_id UUID := '40000000-0000-0000-0000-000000000001';
    v_rol_operativo_id UUID := '41000000-0000-0000-0000-000000000001';
    v_asignacion_operativa_id UUID := '42000000-0000-0000-0000-000000000001';

    v_perm_op_comandas_crear UUID := '43000000-0000-0000-0000-000000000001';
    v_perm_op_comandas_cancelar UUID := '43000000-0000-0000-0000-000000000002';
    v_perm_op_pagos_cobrar UUID := '43000000-0000-0000-0000-000000000003';
    v_perm_op_cortes_ver UUID := '43000000-0000-0000-0000-000000000004';
    v_perm_op_inventario_ver UUID := '43000000-0000-0000-0000-000000000005';
BEGIN
    INSERT INTO "AspNetUsers"
    (
        "Id",
        "UserName",
        "NormalizedUserName",
        "Email",
        "NormalizedEmail",
        "EmailConfirmed",
        "PasswordHash",
        "SecurityStamp",
        "ConcurrencyStamp",
        "PhoneNumber",
        "PhoneNumberConfirmed",
        "TwoFactorEnabled",
        "LockoutEnd",
        "LockoutEnabled",
        "AccessFailedCount",
        activo,
        creado_en,
        actualizado_en
    )
    VALUES
    (
        v_usuario_id,
        'admin@rinconmaya.test',
        'ADMIN@RINCONMAYA.TEST',
        'admin@rinconmaya.test',
        'ADMIN@RINCONMAYA.TEST',
        TRUE,
        'AQAAAAIAAYagAAAAEC6Ada3MpNsBrb/Ke18ktpiy0TtoPGRgxR/hYJiMnndaGs9QMN10jhZq8+tlEroRiA==',
        'seed-security-stamp-admin',
        'seed-concurrency-stamp-admin',
        NULL,
        FALSE,
        FALSE,
        NULL,
        TRUE,
        0,
        TRUE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT ("Id") DO UPDATE
    SET
        "UserName" = EXCLUDED."UserName",
        "NormalizedUserName" = EXCLUDED."NormalizedUserName",
        "Email" = EXCLUDED."Email",
        "NormalizedEmail" = EXCLUDED."NormalizedEmail",
        "EmailConfirmed" = EXCLUDED."EmailConfirmed",
        "PasswordHash" = EXCLUDED."PasswordHash",
        activo = EXCLUDED.activo,
        actualizado_en = CURRENT_TIMESTAMP;

    INSERT INTO inquilinos (id, codigo, nombre, estado, creado_en)
    VALUES (v_inquilino_id, 'RINCON-MAYA', 'Rincon Maya', 'activo', CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE
    SET codigo = EXCLUDED.codigo,
        nombre = EXCLUDED.nombre,
        estado = EXCLUDED.estado;

    INSERT INTO roles_inquilino (id, id_inquilino, codigo, nombre, descripcion, activo)
    VALUES
    (
        v_rol_inquilino_id,
        v_inquilino_id,
        'OWNER',
        'Propietario',
        'Acceso completo a configuracion del inquilino',
        TRUE
    )
    ON CONFLICT (id) DO UPDATE
    SET codigo = EXCLUDED.codigo,
        nombre = EXCLUDED.nombre,
        descripcion = EXCLUDED.descripcion,
        activo = EXCLUDED.activo;

    INSERT INTO permisos_inquilino (id, codigo, nombre, descripcion)
    VALUES
        (v_perm_inq_configurar, 'inquilinos.configurar', 'Configurar inquilino', 'Permite modificar la configuracion del inquilino'),
        (v_perm_inq_rest_crear, 'restaurantes.crear', 'Crear restaurantes', 'Permite crear restaurantes'),
        (v_perm_inq_rest_editar, 'restaurantes.editar', 'Editar restaurantes', 'Permite editar restaurantes'),
        (v_perm_inq_unidad_crear, 'unidades_operativas.crear', 'Crear unidades operativas', 'Permite crear unidades operativas'),
        (v_perm_inq_usuarios_invitar, 'usuarios.invitar', 'Invitar usuarios', 'Permite invitar usuarios al inquilino')
    ON CONFLICT (id) DO UPDATE
    SET codigo = EXCLUDED.codigo,
        nombre = EXCLUDED.nombre,
        descripcion = EXCLUDED.descripcion;

    INSERT INTO roles_inquilino_permisos (id_rol_inquilino, id_permiso_inquilino)
    VALUES
        (v_rol_inquilino_id, v_perm_inq_configurar),
        (v_rol_inquilino_id, v_perm_inq_rest_crear),
        (v_rol_inquilino_id, v_perm_inq_rest_editar),
        (v_rol_inquilino_id, v_perm_inq_unidad_crear),
        (v_rol_inquilino_id, v_perm_inq_usuarios_invitar)
    ON CONFLICT DO NOTHING;

    INSERT INTO asignaciones_inquilino
    (
        id,
        codigo,
        id_usuario,
        id_inquilino,
        id_rol_inquilino,
        activo,
        fecha_inicio,
        fecha_fin
    )
    VALUES
    (
        v_asignacion_inquilino_id,
        'ASIG-TENANT-OWNER',
        v_usuario_id,
        v_inquilino_id,
        v_rol_inquilino_id,
        TRUE,
        CURRENT_DATE,
        NULL
    )
    ON CONFLICT (id) DO UPDATE
    SET codigo = EXCLUDED.codigo,
        id_usuario = EXCLUDED.id_usuario,
        id_inquilino = EXCLUDED.id_inquilino,
        id_rol_inquilino = EXCLUDED.id_rol_inquilino,
        activo = EXCLUDED.activo,
        fecha_inicio = EXCLUDED.fecha_inicio,
        fecha_fin = EXCLUDED.fecha_fin;

    INSERT INTO restaurantes (id, id_inquilino, codigo, nombre, descripcion, logo_url, activo)
    VALUES
    (
        v_restaurante_id,
        v_inquilino_id,
        'RM-REST',
        'Rincon Maya Restaurante',
        'Restaurante demo para pruebas de infraestructura multitenant',
        NULL,
        TRUE
    )
    ON CONFLICT (id) DO UPDATE
    SET codigo = EXCLUDED.codigo,
        nombre = EXCLUDED.nombre,
        descripcion = EXCLUDED.descripcion,
        logo_url = EXCLUDED.logo_url,
        activo = EXCLUDED.activo;

    INSERT INTO entidades_fiscales
    (
        id,
        id_inquilino,
        rfc,
        razon_social,
        regimen_fiscal,
        correo,
        telefono,
        activo
    )
    VALUES
    (
        v_entidad_fiscal_id,
        v_inquilino_id,
        'XAXX010101000',
        'Rincon Maya SA de CV',
        'General de Ley Personas Morales',
        'facturacion@rinconmaya.test',
        '9990000000',
        TRUE
    )
    ON CONFLICT (id) DO UPDATE
    SET rfc = EXCLUDED.rfc,
        razon_social = EXCLUDED.razon_social,
        regimen_fiscal = EXCLUDED.regimen_fiscal,
        correo = EXCLUDED.correo,
        telefono = EXCLUDED.telefono,
        activo = EXCLUDED.activo;

    INSERT INTO direcciones
    (
        id,
        id_inquilino,
        pais,
        estado,
        municipio,
        colonia,
        codigo_postal,
        calle,
        numero_exterior,
        numero_interior,
        referencia,
        latitud,
        longitud
    )
    VALUES
    (
        v_direccion_id,
        v_inquilino_id,
        'Mexico',
        'Yucatan',
        'Merida',
        'Centro',
        '97000',
        'Calle 60',
        '123',
        NULL,
        'Seed inicial',
        NULL,
        NULL
    )
    ON CONFLICT (id) DO UPDATE
    SET pais = EXCLUDED.pais,
        estado = EXCLUDED.estado,
        municipio = EXCLUDED.municipio,
        colonia = EXCLUDED.colonia,
        codigo_postal = EXCLUDED.codigo_postal,
        calle = EXCLUDED.calle,
        numero_exterior = EXCLUDED.numero_exterior,
        numero_interior = EXCLUDED.numero_interior,
        referencia = EXCLUDED.referencia,
        latitud = EXCLUDED.latitud,
        longitud = EXCLUDED.longitud;

    INSERT INTO unidades_operativas
    (
        id,
        codigo,
        id_inquilino,
        id_restaurante,
        id_entidad_fiscal,
        id_direccion,
        nombre,
        activo,
        fecha_apertura
    )
    VALUES
    (
        v_unidad_operativa_id,
        'RM-CENTRO',
        v_inquilino_id,
        v_restaurante_id,
        v_entidad_fiscal_id,
        v_direccion_id,
        'Rincon Maya Centro',
        TRUE,
        CURRENT_DATE
    )
    ON CONFLICT (id) DO UPDATE
    SET codigo = EXCLUDED.codigo,
        id_restaurante = EXCLUDED.id_restaurante,
        id_entidad_fiscal = EXCLUDED.id_entidad_fiscal,
        id_direccion = EXCLUDED.id_direccion,
        nombre = EXCLUDED.nombre,
        activo = EXCLUDED.activo,
        fecha_apertura = EXCLUDED.fecha_apertura;

    INSERT INTO empleados
    (
        id,
        id_usuario,
        id_inquilino,
        numero_empleado,
        nombres,
        apellidos,
        telefono,
        activo
    )
    VALUES
    (
        v_empleado_id,
        v_usuario_id,
        v_inquilino_id,
        'EMP-0001',
        'Admin',
        'Sistema',
        NULL,
        TRUE
    )
    ON CONFLICT (id) DO UPDATE
    SET id_usuario = EXCLUDED.id_usuario,
        id_inquilino = EXCLUDED.id_inquilino,
        numero_empleado = EXCLUDED.numero_empleado,
        nombres = EXCLUDED.nombres,
        apellidos = EXCLUDED.apellidos,
        telefono = EXCLUDED.telefono,
        activo = EXCLUDED.activo;

    INSERT INTO roles_operativos (id, id_inquilino, nombre, descripcion)
    VALUES
    (
        v_rol_operativo_id,
        v_inquilino_id,
        'Gerente',
        'Acceso operativo completo de la unidad'
    )
    ON CONFLICT (id) DO UPDATE
    SET nombre = EXCLUDED.nombre,
        descripcion = EXCLUDED.descripcion;

    INSERT INTO permisos_operativos (id, codigo, nombre, descripcion)
    VALUES
        (v_perm_op_comandas_crear, 'comandas.crear', 'Crear comandas', 'Permite crear comandas'),
        (v_perm_op_comandas_cancelar, 'comandas.cancelar', 'Cancelar comandas', 'Permite cancelar comandas'),
        (v_perm_op_pagos_cobrar, 'pagos.cobrar', 'Cobrar pagos', 'Permite cobrar pagos'),
        (v_perm_op_cortes_ver, 'cortes.ver', 'Ver cortes', 'Permite consultar cortes'),
        (v_perm_op_inventario_ver, 'inventario.ver', 'Ver inventario', 'Permite consultar inventario')
    ON CONFLICT (id) DO UPDATE
    SET codigo = EXCLUDED.codigo,
        nombre = EXCLUDED.nombre,
        descripcion = EXCLUDED.descripcion;

    INSERT INTO roles_operativos_permisos (id_rol_operativo, id_permiso_operativo)
    VALUES
        (v_rol_operativo_id, v_perm_op_comandas_crear),
        (v_rol_operativo_id, v_perm_op_comandas_cancelar),
        (v_rol_operativo_id, v_perm_op_pagos_cobrar),
        (v_rol_operativo_id, v_perm_op_cortes_ver),
        (v_rol_operativo_id, v_perm_op_inventario_ver)
    ON CONFLICT DO NOTHING;

    INSERT INTO asignaciones_operativas
    (
        id,
        codigo,
        id_empleado,
        id_unidad_operativa,
        id_rol_operativo,
        activo,
        fecha_inicio,
        fecha_fin
    )
    VALUES
    (
        v_asignacion_operativa_id,
        'ASIG-OP-GERENTE',
        v_empleado_id,
        v_unidad_operativa_id,
        v_rol_operativo_id,
        TRUE,
        CURRENT_DATE,
        NULL
    )
    ON CONFLICT (id) DO UPDATE
    SET codigo = EXCLUDED.codigo,
        id_empleado = EXCLUDED.id_empleado,
        id_unidad_operativa = EXCLUDED.id_unidad_operativa,
        id_rol_operativo = EXCLUDED.id_rol_operativo,
        activo = EXCLUDED.activo,
        fecha_inicio = EXCLUDED.fecha_inicio,
        fecha_fin = EXCLUDED.fecha_fin;
END $$;

COMMIT;

-- IDs utiles para pruebas:
--   id_usuario:          10000000-0000-0000-0000-000000000001
--   id_inquilino:        20000000-0000-0000-0000-000000000001
--   id_unidad_operativa: 33000000-0000-0000-0000-000000000001
--
-- Headers para /api/me:
--   X-Tenant-Id: 20000000-0000-0000-0000-000000000001
--   X-Operational-Unit-Id: 33000000-0000-0000-0000-000000000001
