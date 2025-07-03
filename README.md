# RGBridge PMS Integration Platform

A robust, extensible, and automated integration platform that standardizes diverse Property Management System (PMS) messages into the RGBridge format.

## 🚀 Features

- **API Gateway**: REST endpoints for each PMS with authentication
- **Message Validation**: Schema validation for incoming PMS messages and outgoing RGBridge XML
- **Plugin System**: Auto-discoverable PMS translators with decorator-based registration
- **Mapping Knowledge Base**: YAML-based attribute/tag mapping system
- **Utility Modules**: Date, currency, LOS pattern, and boolean conversion utilities
- **Error Handling**: Comprehensive error handling with retry logic
- **Testing**: Automated unit and integration tests
- **Documentation**: Comprehensive documentation and monitoring

## 📋 Requirements

- Python 3.8+
- FastAPI
- Pydantic
- PyYAML
- pytest

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/manoj-sharma-rg/h2.git
   cd h2
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## 🚀 Quick Start

1. **Run the application**
   ```bash
   uvicorn app.main:app --reload
   ```

2. **Access the API documentation**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

3. **Test the health endpoint**
   ```bash
   curl http://localhost:8000/health
   ```

## 📁 Project Structure

```
h2/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Configuration management
│   │   └── logging.py          # Logging setup
│   ├── api/
│   │   ├── __init__.py
│   │   └── endpoints.py        # API endpoints
│   ├── plugins/
│   │   ├── __init__.py
│   │   ├── base.py             # Base translator class
│   │   └── registry.py         # Plugin registry
│   └── utils/
│       ├── __init__.py
│       ├── date_utils.py       # Date utilities
│       ├── currency_utils.py   # Currency utilities
│       ├── los_utils.py        # LOS pattern utilities
│       └── boolean_utils.py    # Boolean utilities
├── tests/
│   ├── __init__.py
│   ├── test_utils.py           # Utility tests
│   └── test_plugins.py         # Plugin system tests
├── mappings/                   # PMS mapping files (YAML)
├── schemas/                    # XSD schemas for validation
├── requirements.txt
├── README.md
├── BRD.md                      # Business Requirements Document
└── PRD.md                      # Product Requirements Document
```

## 🔧 Configuration

The application uses environment variables for configuration. Key settings:

```bash
# Server settings
HOST=0.0.0.0
PORT=8000
DEBUG=false

# Authentication
API_KEYS=key1,key2,key3

# Internal API
INTERNAL_API_URL=http://localhost:8080
INTERNAL_API_TIMEOUT=30
INTERNAL_API_RETRY_ATTEMPTS=3

# Logging
LOG_LEVEL=INFO

# File paths
MAPPING_DIR=mappings
SCHEMA_DIR=schemas
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_utils.py

# Run with coverage
pytest --cov=app tests/
```

## 🔌 Adding a New PMS

1. **Create a translator class**
   ```python
   from app.plugins.base import BasePMSTranslator, MessageType
   from app.plugins.registry import register_translator

   @register_translator("new_pms")
   class NewPMSTranslator(BasePMSTranslator):
       @property
       def supported_formats(self):
           return ["JSON", "XML"]
       
       @property
       def supported_message_types(self):
           return [MessageType.AVAILABILITY, MessageType.RATE]
       
       def validate_message(self, message, message_type):
           # Implement validation logic
           return True
       
       def translate_availability(self, message):
           # Implement availability translation
           return {"hotel_code": "HOTEL1", "status": "available"}
       
       def translate_rate(self, message):
           # Implement rate translation
           return {"hotel_code": "HOTEL1", "rate": 100.00}
   ```

2. **Create mapping file**
   ```yaml
   # mappings/new_pms.yaml
   availability:
     hotel_code: "hotel.id"
     status: "availability.status"
     start_date: "availability.start_date"
     end_date: "availability.end_date"
   
   rate:
     hotel_code: "hotel.id"
     rate_amount: "rate.amount"
     currency: "rate.currency"
     start_date: "rate.start_date"
     end_date: "rate.end_date"
   ```

3. **Test the integration**
   ```bash
   # Test with sample data
   curl -X POST http://localhost:8000/api/v1/pms/new_pms \
     -H "Content-Type: application/json" \
     -H "X-API-Key: your-api-key" \
     -d '{"hotel": {"id": "HOTEL1"}, "availability": {"status": "available"}}'
   ```

## 📊 API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health information

### PMS Endpoints
- `GET /api/v1/pms/{pms_code}` - Get PMS information
- `POST /api/v1/pms/{pms_code}` - Receive PMS message
- `GET /api/v1/pms` - List available PMS endpoints

## 🔍 Monitoring

The application provides comprehensive logging:

- **Request/Response logging**: All API requests and responses
- **Translation logging**: PMS message translation activities
- **Error logging**: Detailed error information with stack traces
- **Performance logging**: Response times and system metrics

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t rgbridge-pms .

# Run container
docker run -p 8000:8000 rgbridge-pms
```

### Production
```bash
# Run with production server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📚 Documentation

- [Business Requirements Document](BRD.md)
- [Product Requirements Document](PRD.md)
- [API Documentation](http://localhost:8000/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation and API docs

---

**RGBridge PMS Integration Platform** - Streamlining PMS integrations with automation and standardization. 