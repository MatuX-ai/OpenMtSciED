"""Add hardware project related tables

Revision ID: add_hardware_project_tables
Revises: 
Create Date: 2026-04-13

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_hardware_project_tables'
down_revision = None  # 需要根据实际的上一个migration ID调整
branch_labels = None
depends_on = None


def upgrade():
    """Upgrade database schema"""
    
    # Create enum types
    op.execute("""
        CREATE TYPE hardwarecategory AS ENUM (
            'electronics', 'robotics', 'iot', 'mechanical', 
            'smart_home', 'sensor', 'communication'
        )
    """)
    
    op.execute("""
        CREATE TYPE codelanguage AS ENUM (
            'arduino', 'python', 'blockly', 'scratch'
        )
    """)
    
    op.execute("""
        CREATE TYPE mcuetype AS ENUM (
            'arduino_nano', 'arduino_uno', 'esp32', 
            'esp8266', 'raspberry_pi_pico'
        )
    """)
    
    # Create hardware_project_templates table
    op.create_table(
        'hardware_project_templates',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('project_id', sa.String(50), unique=True, nullable=False, index=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('category', postgresql.ENUM(name='hardwarecategory', create_type=False), nullable=False, index=True),
        sa.Column('difficulty', sa.Integer(), nullable=False),
        sa.Column('subject', sa.String(50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('learning_objectives', postgresql.JSON(astext_type=sa.Text()), default=list),
        sa.Column('estimated_time_hours', sa.Float(), nullable=False),
        sa.Column('total_cost', sa.Float(), nullable=False),
        sa.Column('budget_verified', sa.Boolean(), default=False),
        sa.Column('mcu_type', postgresql.ENUM(name='mcuetype', create_type=False)),
        sa.Column('wiring_instructions', sa.Text()),
        sa.Column('circuit_diagram_path', sa.String(500)),
        sa.Column('safety_notes', postgresql.JSON(astext_type=sa.Text()), default=list),
        sa.Column('common_issues', postgresql.JSON(astext_type=sa.Text()), default=list),
        sa.Column('teaching_guide', sa.Text()),
        sa.Column('webusb_support', sa.Boolean(), default=False),
        sa.Column('supported_boards', postgresql.JSON(astext_type=sa.Text()), default=list),
        sa.Column('knowledge_point_ids', postgresql.JSON(astext_type=sa.Text()), default=list),
        sa.Column('thumbnail_path', sa.String(500)),
        sa.Column('demo_video_url', sa.String(500)),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_featured', sa.Boolean(), default=False),
        sa.Column('usage_count', sa.Integer(), default=0),
        sa.Column('average_rating', sa.Float(), default=0.0),
        sa.Column('review_count', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), index=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Index('idx_hw_template_category', 'category'),
        sa.Index('idx_hw_template_difficulty', 'difficulty'),
        sa.Index('idx_hw_template_subject', 'subject'),
        sa.Index('idx_hw_template_cost', 'total_cost'),
    )
    
    # Create hardware_materials table
    op.create_table(
        'hardware_materials',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('template_id', sa.Integer(), sa.ForeignKey('hardware_project_templates.id'), nullable=False, index=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False, default=1),
        sa.Column('unit', sa.String(20), default='个'),
        sa.Column('unit_price', sa.Float(), nullable=False),
        sa.Column('subtotal', sa.Float()),
        sa.Column('supplier_link', sa.String(500)),
        sa.Column('alternative_suggestion', sa.Text()),
        sa.Column('component_type', sa.String(50)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Index('idx_hw_material_template', 'template_id'),
    )
    
    # Create code_templates table
    op.create_table(
        'code_templates',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('hardware_template_id', sa.Integer(), sa.ForeignKey('hardware_project_templates.id'), index=True),
        sa.Column('study_project_id', sa.Integer(), sa.ForeignKey('study_projects.id'), index=True),
        sa.Column('language', postgresql.ENUM(name='codelanguage', create_type=False), nullable=False),
        sa.Column('title', sa.String(200)),
        sa.Column('code', sa.Text(), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('dependencies', postgresql.JSON(astext_type=sa.Text()), default=list),
        sa.Column('pin_configurations', postgresql.JSON(astext_type=sa.Text()), default=list),
        sa.Column('version', sa.Integer(), default=1),
        sa.Column('is_primary', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), index=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Index('idx_code_hw_template', 'hardware_template_id'),
        sa.Index('idx_code_study_project', 'study_project_id'),
        sa.Index('idx_code_language', 'language'),
    )
    
    # Modify study_projects table, add hardware project related fields
    op.add_column('study_projects', sa.Column('hardware_template_id', sa.Integer(), sa.ForeignKey('hardware_project_templates.id'), index=True))
    op.add_column('study_projects', sa.Column('mcu_type_used', postgresql.ENUM(name='mcuetype', create_type=False)))
    op.add_column('study_projects', sa.Column('actual_cost', sa.Float()))
    op.add_column('study_projects', sa.Column('completion_photos', postgresql.JSON(astext_type=sa.Text()), default=list))
    op.add_column('study_projects', sa.Column('demonstration_video_url', sa.String(500)))
    op.add_column('study_projects', sa.Column('webusb_flashed', sa.Boolean(), default=False))
    op.add_column('study_projects', sa.Column('flash_timestamp', sa.DateTime(timezone=True)))
    
    # Modify peer_reviews table, add hardware review related fields
    op.add_column('peer_reviews', sa.Column('hardware_functionality_score', sa.Integer()))
    op.add_column('peer_reviews', sa.Column('code_quality_score', sa.Integer()))
    op.add_column('peer_reviews', sa.Column('creativity_score', sa.Integer()))
    op.add_column('peer_reviews', sa.Column('documentation_score', sa.Integer()))
    op.add_column('peer_reviews', sa.Column('hardware_feedback', sa.Text()))
    op.add_column('peer_reviews', sa.Column('code_feedback', sa.Text()))
    op.add_column('peer_reviews', sa.Column('improvement_suggestions', postgresql.JSON(astext_type=sa.Text()), default=list))
    op.add_column('peer_reviews', sa.Column('review_photos', postgresql.JSON(astext_type=sa.Text()), default=list))
    op.add_column('peer_reviews', sa.Column('test_results', postgresql.JSON(astext_type=sa.Text()), default=dict))


def downgrade():
    """Downgrade database schema"""
    
    # Drop extended fields from peer_reviews table
    op.drop_column('peer_reviews', 'test_results')
    op.drop_column('peer_reviews', 'review_photos')
    op.drop_column('peer_reviews', 'improvement_suggestions')
    op.drop_column('peer_reviews', 'code_feedback')
    op.drop_column('peer_reviews', 'hardware_feedback')
    op.drop_column('peer_reviews', 'documentation_score')
    op.drop_column('peer_reviews', 'creativity_score')
    op.drop_column('peer_reviews', 'code_quality_score')
    op.drop_column('peer_reviews', 'hardware_functionality_score')
    
    # Drop extended fields from study_projects table
    op.drop_column('study_projects', 'flash_timestamp')
    op.drop_column('study_projects', 'webusb_flashed')
    op.drop_column('study_projects', 'demonstration_video_url')
    op.drop_column('study_projects', 'completion_photos')
    op.drop_column('study_projects', 'actual_cost')
    op.drop_column('study_projects', 'mcu_type_used')
    op.drop_column('study_projects', 'hardware_template_id')
    
    # Drop newly created tables
    op.drop_table('code_templates')
    op.drop_table('hardware_materials')
    op.drop_table('hardware_project_templates')
    
    # Drop enum types
    op.execute('DROP TYPE IF EXISTS mcuetype')
    op.execute('DROP TYPE IF EXISTS codelanguage')
    op.execute('DROP TYPE IF EXISTS hardwarecategory')
