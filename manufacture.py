# Fusion 360 Python Script
# Beginner-friendly rough version of the given part
# Copy this into Fusion 360 Scripts and Run

import adsk.core, adsk.fusion, traceback

def run(context):
    ui = None
    try:
        app = adsk.core.Application.get()
        ui  = app.userInterface

        design = app.activeProduct
        rootComp = design.rootComponent

        # =========================
        # CREATE BASE
        # =========================

        sketches = rootComp.sketches
        xyPlane = rootComp.xYConstructionPlane

        sketch = sketches.add(xyPlane)

        circles = sketch.sketchCurves.sketchCircles
        lines = sketch.sketchCurves.sketchLines

        # Left circle
        circles.addByCenterRadius(
            adsk.core.Point3D.create(0, 0, 0),
            1.6
        )

        # Right circle
        circles.addByCenterRadius(
            adsk.core.Point3D.create(6.8, 0, 0),
            1.6
        )

        # Connecting lines
        lines.addByTwoPoints(
            adsk.core.Point3D.create(0, 1.6, 0),
            adsk.core.Point3D.create(6.8, 1.6, 0)
        )

        lines.addByTwoPoints(
            adsk.core.Point3D.create(0, -1.6, 0),
            adsk.core.Point3D.create(6.8, -1.6, 0)
        )

        prof = sketch.profiles.item(0)

        extrudes = rootComp.features.extrudeFeatures
        extInput = extrudes.createInput(
            prof,
            adsk.fusion.FeatureOperations.NewBodyFeatureOperation
        )

        distance = adsk.core.ValueInput.createByReal(0.8)

        extInput.setDistanceExtent(
            False,
            distance
        )

        baseExtrude = extrudes.add(extInput)

        body = baseExtrude.bodies.item(0)

        # =========================
        # CUT HOLES IN BASE
        # =========================

        topFace = body.faces.item(0)

        holeSketch = sketches.add(topFace)

        holeCircles = holeSketch.sketchCurves.sketchCircles

        holeCircles.addByCenterRadius(
            adsk.core.Point3D.create(0, 0, 0),
            0.8
        )

        holeCircles.addByCenterRadius(
            adsk.core.Point3D.create(6.8, 0, 0),
            0.8
        )

        for i in range(holeSketch.profiles.count):
            holeProf = holeSketch.profiles.item(i)

            cutInput = extrudes.createInput(
                holeProf,
                adsk.fusion.FeatureOperations.CutFeatureOperation
            )

            cutDistance = adsk.core.ValueInput.createByReal(1)

            cutInput.setDistanceExtent(
                False,
                cutDistance
            )

            extrudes.add(cutInput)

        # =========================
        # CREATE VERTICAL WALL
        # =========================

        wallSketch = sketches.add(topFace)

        rectLines = wallSketch.sketchCurves.sketchLines

        rectLines.addCenterPointRectangle(
            adsk.core.Point3D.create(3.4, 0, 0),
            adsk.core.Point3D.create(4.2, 0.5, 0)
        )

        wallProf = wallSketch.profiles.item(0)

        wallInput = extrudes.createInput(
            wallProf,
            adsk.fusion.FeatureOperations.JoinFeatureOperation
        )

        wallHeight = adsk.core.ValueInput.createByReal(3.5)

        wallInput.setDistanceExtent(
            False,
            wallHeight
        )

        wallExtrude = extrudes.add(wallInput)

        # =========================
        # CREATE TOP ARM
        # =========================

        wallBody = wallExtrude.bodies.item(0)

        sideFace = wallBody.faces.item(0)

        armSketch = sketches.add(sideFace)

        armLines = armSketch.sketchCurves.sketchLines

        armLines.addCenterPointRectangle(
            adsk.core.Point3D.create(1.5, 1.5, 0),
            adsk.core.Point3D.create(3, 2, 0)
        )

        armProf = armSketch.profiles.item(0)

        armInput = extrudes.createInput(
            armProf,
            adsk.fusion.FeatureOperations.JoinFeatureOperation
        )

        armLength = adsk.core.ValueInput.createByReal(1.6)

        armInput.setDistanceExtent(
            False,
            armLength
        )

        armExtrude = extrudes.add(armInput)

        # =========================
        # CREATE FRONT CYLINDER
        # =========================

        armBody = armExtrude.bodies.item(0)

        frontFace = armBody.faces.item(0)

        cylSketch = sketches.add(frontFace)

        cylCircles = cylSketch.sketchCurves.sketchCircles

        cylCircles.addByCenterRadius(
            adsk.core.Point3D.create(0, 0, 0),
            1.5
        )

        cylCircles.addByCenterRadius(
            adsk.core.Point3D.create(0, 0, 0),
            1
        )

        ringProf = cylSketch.profiles.item(1)

        cylInput = extrudes.createInput(
            ringProf,
            adsk.fusion.FeatureOperations.JoinFeatureOperation
        )

        cylDistance = adsk.core.ValueInput.createByReal(1)

        cylInput.setDistanceExtent(
            False,
            cylDistance
        )

        extrudes.add(cylInput)

        ui.messageBox('Part Created Successfully 😭')

    except:
        if ui:
            ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))