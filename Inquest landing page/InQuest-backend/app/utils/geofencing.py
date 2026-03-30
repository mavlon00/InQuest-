"""
Geofencing and distance calculation utilities.

This module provides functions for calculating distances between coordinates
using the Haversine formula and checking if points are within geofence boundaries.
"""

import math
from typing import Tuple
from config import settings


def haversine_distance(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """
    Calculate the great-circle distance between two points on Earth using the Haversine formula.
    
    The Haversine formula calculates the shortest distance between two points on a sphere
    given their latitudes and longitudes.
    
    Args:
        lat1: Latitude of the first point in degrees.
        lon1: Longitude of the first point in degrees.
        lat2: Latitude of the second point in degrees.
        lon2: Longitude of the second point in degrees.
        
    Returns:
        Distance in meters between the two points.
        
    Example:
        >>> distance = haversine_distance(6.5244, 3.3792, 6.5246, 3.3794)
        >>> print(f"Distance: {distance:.2f} meters")
    """
    # Earth's radius in meters
    R = 6_371_000

    # Convert degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Differences
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    # Haversine formula
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c

    return distance


def is_within_geofence(
    user_lat: float,
    user_lon: float,
    geofence_lat: float,
    geofence_lon: float,
    radius_meters: float = None,
) -> bool:
    """
    Check if a user's location is within a geofence radius.
    
    Uses the Haversine formula to calculate distance and compares with the specified radius.
    If no radius is provided, uses the default from configuration.
    
    Args:
        user_lat: User's latitude.
        user_lon: User's longitude.
        geofence_lat: Geofence center latitude.
        geofence_lon: Geofence center longitude.
        radius_meters: Radius of the geofence in meters. Defaults to GEOFENCE_RADIUS_METERS.
        
    Returns:
        True if user is within geofence, False otherwise.
        
    Example:
        >>> # Check if driver is within 500m of pickup location
        >>> is_within = is_within_geofence(6.5244, 3.3792, 6.5245, 3.3794, 500)
        >>> print(f"Driver is within geofence: {is_within}")
    """
    if radius_meters is None:
        radius_meters = settings.GEOFENCE_RADIUS_METERS

    distance = haversine_distance(user_lat, user_lon, geofence_lat, geofence_lon)
    return distance <= radius_meters


def get_nearby_points(
    center_lat: float,
    center_lon: float,
    radius_meters: float,
    points: list,
) -> list:
    """
    Filter a list of points (latitude, longitude tuples) that are within a radius.
    
    Args:
        center_lat: Center latitude.
        center_lon: Center longitude.
        radius_meters: Search radius in meters.
        points: List of tuples (latitude, longitude) to filter.
        
    Returns:
        List of points within the specified radius.
    """
    nearby = []
    for point in points:
        if is_within_geofence(
            point[0], point[1], center_lat, center_lon, radius_meters
        ):
            nearby.append(point)
    return nearby


def calculate_bounding_box(
    center_lat: float, center_lon: float, radius_meters: float
) -> dict:
    """
    Calculate a bounding box (approximate rectangular region) around a center point.
    
    This is useful for database queries to filter nearby points before computing
    exact distances with the Haversine formula.
    
    Args:
        center_lat: Center latitude.
        center_lon: Center longitude.
        radius_meters: Radius in meters.
        
    Returns:
        Dictionary with min_lat, max_lat, min_lon, max_lon.
    """
    # Approximate meters per degree
    # 1 degree latitude ≈ 111,000 meters
    # 1 degree longitude ≈ 111,000 * cos(latitude) meters
    meters_per_lat = 111_000

    lat_delta = radius_meters / meters_per_lat
    lon_delta = radius_meters / (meters_per_lat * math.cos(math.radians(center_lat)))

    return {
        "min_lat": center_lat - lat_delta,
        "max_lat": center_lat + lat_delta,
        "min_lon": center_lon - lon_delta,
        "max_lon": center_lon + lon_delta,
    }


def bearing_between_points(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the bearing (initial compass direction) from one point to another.
    
    Returns the compass direction (0-360 degrees) where:
    - 0° = North
    - 90° = East
    - 180° = South
    - 270° = West
    
    Args:
        lat1: Starting latitude.
        lon1: Starting longitude.
        lat2: Ending latitude.
        lon2: Ending longitude.
        
    Returns:
        Bearing in degrees (0-360).
    """
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlon = lon2_rad - lon1_rad

    y = math.sin(dlon) * math.cos(lat2_rad)
    x = math.cos(lat1_rad) * math.sin(lat2_rad) - math.sin(lat1_rad) * math.cos(
        lat2_rad
    ) * math.cos(dlon)

    bearing = math.degrees(math.atan2(y, x))
    bearing = (bearing + 360) % 360

    return bearing


def get_point_at_distance(
    lat: float, lon: float, distance_meters: float, bearing_degrees: float
) -> Tuple[float, float]:
    """
    Calculate a new point at a given distance and bearing from a starting point.
    
    Useful for creating test locations or projecting movement.
    
    Args:
        lat: Starting latitude.
        lon: Starting longitude.
        distance_meters: Distance to travel in meters.
        bearing_degrees: Direction to travel in degrees (0-360).
        
    Returns:
        Tuple of (new_latitude, new_longitude).
    """
    R = 6_371_000  # Earth's radius in meters

    lat_rad = math.radians(lat)
    lon_rad = math.radians(lon)
    bearing_rad = math.radians(bearing_degrees)

    lat2_rad = math.asin(
        math.sin(lat_rad) * math.cos(distance_meters / R)
        + math.cos(lat_rad)
        * math.sin(distance_meters / R)
        * math.cos(bearing_rad)
    )

    lon2_rad = lon_rad + math.atan2(
        math.sin(bearing_rad) * math.sin(distance_meters / R) * math.cos(lat_rad),
        math.cos(distance_meters / R) - math.sin(lat_rad) * math.sin(lat2_rad),
    )

    return math.degrees(lat2_rad), math.degrees(lon2_rad)
